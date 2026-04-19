/**
 * KitaabValue Pricing Engine
 * ---------------------------------------------------------------
 * Formula:
 *   Base Price  = MRP × 0.30
 *   Final SRP   = Base × Condition × Area × Category × Edition
 *
 * Verdict thresholds (Final SRP):
 *   ≥ ₹40   → SELL   (green)
 *   ₹15–39  → MAYBE  (yellow)
 *   < ₹15   → SCRAP  (red)
 */

export type AreaType = 'college' | 'normal' | 'low_demand';
export type Condition = 'like_new' | 'good' | 'bad';
export type Category =
  | 'competitive'    // JEE/NEET/UPSC/CAT — high resale demand
  | 'academic'       // college textbooks
  | 'school'         // NCERT / school books
  | 'fiction'        // novels / self-help
  | 'outdated'       // >5 yrs old edition
  | 'unknown';

export type Verdict = 'SELL' | 'MAYBE' | 'SCRAP';

export interface PriceInput {
  mrp: number;                // printed MRP (₹)
  area: AreaType;
  condition: Condition;
  category?: Category;
  isOutdated?: boolean;       // old edition flag
}

export interface PriceBreakdown {
  mrp: number;
  basePrice: number;
  areaMultiplier: number;
  conditionMultiplier: number;
  categoryMultiplier: number;
  editionMultiplier: number;
  finalPrice: number;
  verdict: Verdict;
  verdictLabel: string;
  verdictReason: string;
}

// ─── Multiplier tables ────────────────────────────────────────────────
export const AREA_MULTIPLIER: Record<AreaType, number> = {
  college:    0.60,
  normal:     0.40,
  low_demand: 0.25,
};

export const CONDITION_MULTIPLIER: Record<Condition, number> = {
  like_new: 1.00,
  good:     0.70,
  bad:      0.40,
};

export const CATEGORY_MULTIPLIER: Record<Category, number> = {
  competitive: 1.20,
  academic:    1.00,
  school:      0.85,
  fiction:     0.75,
  outdated:    0.50,
  unknown:     1.00,
};

// ─── Helpers ──────────────────────────────────────────────────────────
export const AREA_LABEL: Record<AreaType, string> = {
  college:    'College Area',
  normal:     'Normal Area',
  low_demand: 'Low Demand Area',
};

export const CONDITION_LABEL: Record<Condition, string> = {
  like_new: 'Like New',
  good:     'Good',
  bad:      'Bad',
};

/** Round to nearest ₹5 for cash-friendly prices. */
function roundToFive(x: number): number {
  return Math.max(0, Math.round(x / 5) * 5);
}

/** Pick a verdict from the final price. */
function computeVerdict(finalPrice: number): { verdict: Verdict; label: string; reason: string } {
  if (finalPrice >= 40) {
    return {
      verdict: 'SELL',
      label: 'SELL',
      reason: 'Good resale value — accept this book.',
    };
  }
  if (finalPrice >= 15) {
    return {
      verdict: 'MAYBE',
      label: 'MAYBE',
      reason: 'Borderline value — negotiate or bundle with other books.',
    };
  }
  return {
    verdict: 'SCRAP',
    label: 'SCRAP',
    reason: 'Low value — pay scrap/kg rate only.',
  };
}

// ─── Main calculator ──────────────────────────────────────────────────
export function calculatePrice(input: PriceInput): PriceBreakdown {
  const mrp = Math.max(0, Math.round(input.mrp || 0));
  const category = input.category ?? 'unknown';

  const basePrice = Math.round(mrp * 0.30);  // 30% of MRP

  const conditionMultiplier = CONDITION_MULTIPLIER[input.condition];
  const areaMul = AREA_MULTIPLIER[input.area];
  const catMul = CATEGORY_MULTIPLIER[category];
  const editionMul = input.isOutdated ? 0.60 : 1.00;

  const finalPrice = roundToFive(
    basePrice * conditionMultiplier * areaMul * catMul * editionMul
  );

  const v = computeVerdict(finalPrice);

  return {
    mrp,
    basePrice,
    areaMultiplier: areaMul,
    conditionMultiplier,
    categoryMultiplier: catMul,
    editionMultiplier: editionMul,
    finalPrice,
    verdict: v.verdict,
    verdictLabel: v.label,
    verdictReason: v.reason,
  };
}

// ─── Category inference from title / publisher ────────────────────────
const CATEGORY_KEYWORDS: { cat: Category; words: string[] }[] = [
  { cat: 'competitive', words: [
    'jee', 'neet', 'upsc', 'ssc', 'cat ', 'gate', 'gmat', 'gre',
    'arihant', 'disha', 'mtg', 'cengage', 'allen', 'aakash',
    'hc verma', 'rd sharma', 'rs aggarwal', 'quantitative aptitude',
    'lucent', 'pearson iit', 'olympiad',
  ]},
  { cat: 'school', words: [
    'ncert', 'class x', 'class xii', 'class 10', 'class 12',
    'cbse', 'icse', 'state board', 'sample paper', 'oswaal',
  ]},
  { cat: 'academic', words: [
    'textbook', 'university', 'engineering', 'mechanical', 'electrical',
    'computer network', 'operating system', 'database', 'data structure',
    'calculus', 'thermodynamics', 'discrete mathematics', 'organic chemistry',
  ]},
  { cat: 'fiction', words: [
    'novel', 'harry potter', 'chetan bhagat', 'paulo coelho',
    'rich dad', 'atomic habits', 'ikigai', 'sapiens', 'thinking fast',
    'penguin', 'rupa publications', 'fingerprint',
  ]},
];

export function inferCategory(title: string, publisher?: string): Category {
  const hay = `${title} ${publisher ?? ''}`.toLowerCase();
  for (const group of CATEGORY_KEYWORDS) {
    if (group.words.some(w => hay.includes(w))) return group.cat;
  }
  return 'unknown';
}
