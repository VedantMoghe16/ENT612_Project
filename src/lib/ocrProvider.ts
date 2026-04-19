/**
 * OCR Provider
 * ---------------------------------------------------------------
 * Two backends, same interface:
 *   1. Google Cloud Vision (DOCUMENT_TEXT_DETECTION)
 *   2. OpenAI Vision (gpt-4o-mini) — preferred for structured extraction
 *
 * Env vars (set whichever you're using):
 *   OCR_PROVIDER                = 'openai' | 'google'    (default: 'openai')
 *   OPENAI_API_KEY              = sk-...
 *   GOOGLE_APPLICATION_CREDENTIALS_JSON = '{...}'  (service account JSON as string)
 */

export interface OcrResult {
  text: string;
  provider: 'openai' | 'google' | 'mock';
  structured?: {
    mrp?: number | null;
    title?: string | null;
    author?: string | null;
    publisher?: string | null;
    subject?: string | null;
    isbn?: string | null;
    classLevel?: number | null;
    editionYear?: number | null;
  };
}

// ─── Provider 1: OpenAI Vision ────────────────────────────────────────
async function ocrWithOpenAI(base64Image: string): Promise<OcrResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  // dynamic import so the package isn't required if provider is google
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });

  const dataUrl = base64Image.startsWith('data:')
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;

  // PASS 1: Extract book identity metadata from cover
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are an expert book scanner for Indian textbooks. Extract all identifying information from this book cover.\n\n' +
          'Return ONLY valid JSON with these keys:\n' +
          '  raw_text    — ALL visible text on the cover (string)\n' +
          '  title       — main book title (string or null)\n' +
          '  author      — author name(s) (string or null)\n' +
          '  publisher   — publisher/imprint name (string or null)\n' +
          '  subject     — subject or course e.g. "Physics", "Mathematics", "History" (string or null)\n' +
          '  isbn        — ISBN-13 or ISBN-10 if printed on cover (string or null, digits only)\n' +
          '  class_level — school class/grade number if present e.g. 10, 12 (integer or null)\n' +
          '  edition_year— publication or edition year (integer or null)\n' +
          '  mrp         — printed price in rupees IF visible on cover/spine (integer or null; only set if you see ₹/Rs/MRP label — do NOT guess)',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Read this book cover. Extract the title, author, publisher, subject, and any other identifying information. Return JSON.',
          },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
        ],
      },
    ],
  });

  const content = resp.choices[0]?.message?.content ?? '{}';
  let parsed: any = {};
  try { parsed = JSON.parse(content); } catch { parsed = {}; }

  const text: string = (parsed.raw_text ?? '').toString();

  function str(v: unknown): string | null {
    return typeof v === 'string' && v.trim() ? v.trim() : null;
  }
  function int(v: unknown, min: number, max: number): number | null {
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);
    return !isNaN(n) && n >= min && n <= max ? n : null;
  }

  const title     = str(parsed.title);
  const author    = str(parsed.author);
  const publisher = str(parsed.publisher);
  const subject   = str(parsed.subject);
  const isbn      = str(parsed.isbn)?.replace(/[^0-9X]/gi, '') ?? null;
  const classLevel  = int(parsed.class_level, 1, 12);
  const editionYear = int(parsed.edition_year, 1990, new Date().getFullYear() + 1);
  // Only trust mrp if OpenAI explicitly found it — no guessing
  const mrp       = int(parsed.mrp, 20, 5000);

  return {
    text,
    provider: 'openai',
    structured: { mrp, title, author, publisher, subject, isbn, classLevel, editionYear },
  };
}

// ─── Provider 2: Google Cloud Vision ──────────────────────────────────
async function ocrWithGoogleVision(base64Image: string): Promise<OcrResult> {
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credsJson) throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON not configured');

  const credentials = JSON.parse(credsJson);
  const { ImageAnnotatorClient } = await import('@google-cloud/vision');
  const client = new ImageAnnotatorClient({ credentials });

  // strip data URL prefix if present
  const pureBase64 = base64Image.includes(',')
    ? base64Image.split(',')[1]
    : base64Image;

  const [result] = await client.documentTextDetection({
    image: { content: pureBase64 },
  });

  const text = result.fullTextAnnotation?.text ?? '';
  return { text, provider: 'google' };
}

// ─── Dispatcher ───────────────────────────────────────────────────────
export async function runOcr(base64Image: string): Promise<OcrResult> {
  const provider = (process.env.OCR_PROVIDER ?? 'openai').toLowerCase();

  if (provider === 'google') return ocrWithGoogleVision(base64Image);
  if (provider === 'openai') return ocrWithOpenAI(base64Image);

  throw new Error(`Unknown OCR_PROVIDER: ${provider}`);
}
