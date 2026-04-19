/**
 * OCR Text Parser
 * ---------------------------------------------------------------
 * Takes raw text blocks from Google Vision / OpenAI Vision OCR
 * and extracts structured book metadata:
 *   - MRP (₹ price)
 *   - Title (largest text block / heuristic)
 *   - Publisher (matched against known Indian publishers)
 *   - Edition year / isOutdated flag
 *   - ISBN (bonus)
 */

export interface ParsedBook {
  mrp: number | null;
  mrpConfidence: 'high' | 'medium' | 'low' | 'none';
  title: string | null;
  publisher: string | null;
  editionYear: number | null;
  isOutdated: boolean;
  isbn: string | null;
  rawText: string;
}

// ─── Known Indian publishers (ordered by prevalence) ──────────────────
const INDIAN_PUBLISHERS = [
  'S. Chand', 'S Chand', 'Schand',
  'Arihant', 'Disha', 'MTG', 'Cengage', 'Pearson',
  'McGraw Hill', 'McGraw-Hill', 'TMH', 'Tata McGraw',
  'Oxford', 'Cambridge University Press',
  'NCERT', 'CBSE',
  'Oswaal', 'Full Marks', 'Evergreen', 'Together With', 'Xam Idea',
  'Wiley', 'Elsevier', 'Prentice Hall', 'Pearson Education',
  'Rupa', 'Penguin', 'HarperCollins', 'Fingerprint', 'Jaico',
  'Bharati Bhawan', 'Laxmi Publications', 'Dhanpat Rai',
  'Allen', 'Aakash', 'Resonance', 'FIITJEE',
  'Bhagat', 'Sultan Chand', 'Ramesh Publishing',
  'Nirali Prakashan', 'Technical Publications',
];

// ─── MRP Extraction ───────────────────────────────────────────────────
/**
 * Aggressive strategy to find ANY price in Indian book text
 * Works even with poor OCR output
 */
function extractMRP(text: string): { value: number | null; confidence: ParsedBook['mrpConfidence'] } {
  if (!text || text.length < 2) return { value: null, confidence: 'none' };
  
  const normalized = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

  // ══════════════════════════════════════════════════════════════
  // TIER 1: HIGH CONFIDENCE - explicit MRP with labels
  // ══════════════════════════════════════════════════════════════
  const highPatterns: RegExp[] = [
    /M\.?R\.?P\.?\s*[:\-=]?\s*(?:Rs\.?|₹|INR)?\s*[\s]?(\d{2,4})/i,
    /Maximum\s+Retail\s+Price\s*[:\-=]?\s*(?:Rs\.?|₹|INR)?\s*(\d{2,4})/i,
    /Printed\s+Price\s*[:\-=]?\s*(?:Rs\.?|₹|INR)?\s*(\d{2,4})/i,
    /MRP\s+(\d{2,4})/i,
  ];
  
  for (const re of highPatterns) {
    const m = normalized.match(re);
    if (m) {
      const v = parseInt(m[1], 10);
      if (v >= 20 && v <= 5000) return { value: v, confidence: 'high' };
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TIER 2: MEDIUM CONFIDENCE - currency symbol near number
  // Excludes ISBN/barcode fragments (97[89]-XX-XXX-XXXX pattern).
  // ══════════════════════════════════════════════════════════════

  // Strip ISBN sequences from text before searching so "978-81-219-4700-5"
  // doesn't contribute "4700" as a price candidate.
  const withoutISBN = normalized
    .replace(/\b97[89][\s\-]?(?:\d[\s\-]?){9,12}\d\b/g, '')   // ISBN-13
    .replace(/\bisbn[:\s]*[\d\s\-X]{9,13}/gi, '')               // "ISBN XXXXX"
    .replace(/\b\d{13}\b/g, '')                                  // 13-digit EAN barcodes
    .replace(/\b\d{10}\b/g, '');                                 // 10-digit ISBN/phone

  const mediumPatterns: RegExp[] = [
    /₹\s*\.?\s*(\d{2,4})(?!\d)/,
    /Rs[\.\s]*(\d{2,4})(?!\d)/,
    /INR\s*(\d{2,4})(?!\d)/,
    /Price\s*[:\-=]?\s*(?:Rs\.?|₹|INR)?\s*(\d{2,4})(?!\d)/i,
    /(\d{2,4})\s*\/?\s*-\s*(?=\s*$|\s+[A-Z(])/,  // "450/-" at end of line
    /(\d{2,4})\s*(?:only|rupees)\b/i,
  ];

  const mediumHits: number[] = [];
  for (const re of mediumPatterns) {
    const matches = withoutISBN.matchAll(new RegExp(re.source, 'gi'));
    for (const m of matches) {
      const v = parseInt(m[1], 10);
      if (v >= 20 && v <= 3500) mediumHits.push(v);
    }
  }

  if (mediumHits.length > 0) {
    // Among all hits, prefer the most common Indian textbook price range (₹50–₹2000)
    const preferred = mediumHits.filter(v => v >= 50 && v <= 2000);
    const candidates = preferred.length > 0 ? preferred : mediumHits;
    // Take the median to avoid outliers (not the max, which could be a stray big number)
    const sorted = [...candidates].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return { value: median, confidence: 'medium' };
  }

  // Tier 3 intentionally removed — too many false positives from ISBN/barcode digits.
  return { value: null, confidence: 'none' };
}

// ─── Publisher detection ──────────────────────────────────────────────
function extractPublisher(text: string): string | null {
  const lower = text.toLowerCase();
  // longest-match wins (so "S. Chand Publishing" beats "S. Chand")
  let best: string | null = null;
  for (const pub of INDIAN_PUBLISHERS) {
    if (lower.includes(pub.toLowerCase())) {
      if (!best || pub.length > best.length) best = pub;
    }
  }
  return best;
}

// ─── Title extraction (heuristic) ─────────────────────────────────────
/**
 * Title heuristic:
 *  - Pick the longest line that looks like a title
 *  - Exclude lines that are all caps + short (likely "MRP", "PRICE", etc.)
 *  - Exclude lines with mostly digits
 *  - Prefer lines in the top half of the raw text (book covers: title goes top)
 */
function extractTitle(text: string): string | null {
  const lines = text
    .split(/[\r\n]+/)
    .map(l => l.trim())
    .filter(l => l.length >= 4 && l.length <= 80);

  if (lines.length === 0) return null;

  const scored = lines.map((line, idx) => {
    let score = 0;
    // prefer longer lines (books have meaty titles)
    score += Math.min(line.length, 40);
    // prefer earlier lines (title is usually at top of cover)
    score += Math.max(0, 20 - idx * 2);
    // penalise lines with many digits
    const digits = (line.match(/\d/g) ?? []).length;
    score -= digits * 3;
    // penalise lines that are mostly punctuation
    const punct = (line.match(/[^\w\s]/g) ?? []).length;
    score -= punct * 2;
    // penalise common non-title tokens
    if (/^(mrp|price|rs\.?|₹|inr|edition|vol|volume|part|chapter)/i.test(line)) score -= 30;
    // boost lines with Title Case or ALL CAPS (covers use these)
    if (/^[A-Z][A-Za-z\s&',:-]+$/.test(line)) score += 8;
    if (/^[A-Z\s&',:-]+$/.test(line) && line.length > 6) score += 5;
    return { line, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.line ?? null;
}

// ─── Edition year ─────────────────────────────────────────────────────
function extractEditionYear(text: string): number | null {
  // look for 4-digit years between 1990 and next year
  const currentYear = new Date().getFullYear();
  const matches = text.matchAll(/\b(19\d{2}|20\d{2})\b/g);
  const years: number[] = [];
  for (const m of matches) {
    const y = parseInt(m[1], 10);
    if (y >= 1990 && y <= currentYear + 1) years.push(y);
  }
  if (years.length === 0) return null;
  // return the most recent year (likely current edition)
  return Math.max(...years);
}

// ─── ISBN extraction ──────────────────────────────────────────────────
function extractISBN(text: string): string | null {
  // ISBN-13: 978 or 979 prefix, 10 more digits (may have hyphens)
  const isbn13 = text.match(/\b97[89][\s\-]?(?:\d[\s\-]?){9}\d\b/);
  if (isbn13) return isbn13[0].replace(/[\s\-]/g, '');
  // ISBN-10: 10 digits
  const isbn10 = text.match(/\b(?:\d[\s\-]?){9}[\dX]\b/);
  if (isbn10) return isbn10[0].replace(/[\s\-]/g, '');
  return null;
}

// ─── Main parser ──────────────────────────────────────────────────────
export function parseOcrText(rawText: string): ParsedBook {
  const text = (rawText || '').trim();
  if (!text) {
    return {
      mrp: null, mrpConfidence: 'none',
      title: null, publisher: null,
      editionYear: null, isOutdated: false,
      isbn: null, rawText: '',
    };
  }

  const mrpResult   = extractMRP(text);
  const title       = extractTitle(text);
  const publisher   = extractPublisher(text);
  const editionYear = extractEditionYear(text);
  const isbn        = extractISBN(text);

  const currentYear = new Date().getFullYear();
  const isOutdated  = editionYear !== null && (currentYear - editionYear) > 5;

  return {
    mrp: mrpResult.value,
    mrpConfidence: mrpResult.confidence,
    title,
    publisher,
    editionYear,
    isOutdated,
    isbn,
    rawText: text,
  };
}
