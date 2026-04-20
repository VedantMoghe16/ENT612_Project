export type LangCode = 'en' | 'hi' | 'mr' | 'bn' | 'ta' | 'te' | 'gu' | 'kn' | 'ml';

export interface LangDef {
  code: LangCode;
  native: string;
  sarvamCode: string;
}

export const LANGS: LangDef[] = [
  { code: 'en', native: 'English',    sarvamCode: 'en-IN' },
  { code: 'hi', native: 'हिन्दी',     sarvamCode: 'hi-IN' },
  { code: 'mr', native: 'मराठी',      sarvamCode: 'mr-IN' },
  { code: 'bn', native: 'বাংলা',      sarvamCode: 'bn-IN' },
  { code: 'ta', native: 'தமிழ்',      sarvamCode: 'ta-IN' },
  { code: 'te', native: 'తెలుగు',     sarvamCode: 'te-IN' },
  { code: 'gu', native: 'ગુજરાતી',    sarvamCode: 'gu-IN' },
  { code: 'kn', native: 'ಕನ್ನಡ',     sarvamCode: 'kn-IN' },
  { code: 'ml', native: 'മലയാളം',    sarvamCode: 'ml-IN' },
];

export const STATIC_STRINGS = {
  // Area labels & descriptions
  'area.college':      'College Area',
  'area.normal':       'Normal Area',
  'area.low_demand':   'Low Demand Area',
  'area.college.desc': 'Near campus, hostels — highest resale',
  'area.normal.desc':  'Standard residential / mixed area',
  'area.low.desc':     'Rural / scrap-only demand',
  // Condition labels
  'cond.like_new': 'Like New',
  'cond.good':     'Good',
  'cond.bad':      'Old / Damaged',
  // App shell
  'app.tagline': 'Instant book resale price',
  // Scanner
  'scan.head1':      'Scan a book,',
  'scan.head2':      'get a fair price.',
  'scan.sub':        'Just show the front cover — we look up the price automatically.',
  'scan.zone.title': 'Upload or Capture',
  'scan.zone.sub':   'Show the front cover so we can read the title',
  'scan.camera':     'Camera',
  'scan.upload':     'Upload',
  'scan.scanning':   'Scanning book…',
  // Trust indicators
  'trust.instant':      'Instant',
  'trust.instant.sub':  '2s OCR',
  'trust.accurate':     'Accurate',
  'trust.accurate.sub': 'AI-powered',
  'trust.fair':         'Fair',
  'trust.fair.sub':     'Locality-based',
  // Result card
  'res.paySeller':   'Charge Buyer',
  'res.mrp':         'MRP',
  'res.identified':  'Book Identified',
  'res.condition':   'Book Condition',
  'res.breakdown':   'Price Breakdown',
  'res.bd.mrp':      'Printed MRP',
  'res.bd.base':     'Base (30% of MRP)',
  'res.bd.final':    'Final Price',
  'res.oldEdition':  'Old edition',
  'res.scanAgain':   'Scan Next Book',
  // Manual MRP entry
  'manual.title':       'MRP Not Detected',
  'manual.sub':         'Please enter it manually',
  'manual.weRead':      'We could read',
  'manual.label':       'Printed MRP (₹)',
  'manual.placeholder': 'e.g. 450',
  'manual.hint':        'Look for "M.R.P." or "₹" on the back cover',
  'manual.cancel':      'Cancel',
  'manual.calculate':   'Calculate Price',
  // Breakdown misc
  'res.category':  'Category',
  // Footer & errors
  'footer':        'KitaabValue · Built for Indian book dealers',
  'err.generic':   'Something went wrong. Try again.',
  'err.network':   'Network error. Check your connection.',
} as const;

export type TranslationKey = keyof typeof STATIC_STRINGS;
export type Translations = Record<TranslationKey, string>;
