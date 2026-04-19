/**
 * Market Price Fetcher
 * Fetches real book prices from various online sources
 */

export interface MarketPrice {
  source: string;          // 'amazon' | 'flipkart' | 'google_books' | etc
  newPrice: number | null; // price for new book
  usedPrice: number | null;
  url: string;
  lastUpdated: Date;
  confidence: 'high' | 'medium' | 'low';
}

export interface MarketData {
  title: string;
  isbn?: string;
  author?: string;
  publisher?: string;
  prices: MarketPrice[];
  averageNewPrice: number | null;
  averageUsedPrice: number | null;
  bestResaleValue: number | null;
}

/**
 * Fetch book price from Google Books API.
 * Pricing lives in saleInfo (not volumeInfo) and must be INR.
 */
async function fetchFromGoogleBooks(title: string, isbn?: string): Promise<MarketPrice | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const query = isbn ? `isbn:${isbn}` : `intitle:${encodeURIComponent(title)}`;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY ?? '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3&country=IN${apiKey ? `&key=${apiKey}` : ''}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.items?.length) return null;

    // Walk items until we find one with an INR list price
    for (const item of data.items) {
      const saleInfo = item.saleInfo;
      const volumeInfo = item.volumeInfo;

      // Try saleInfo.listPrice (most accurate)
      const salePrice =
        saleInfo?.listPrice?.currencyCode === 'INR'
          ? saleInfo.listPrice.amount
          : saleInfo?.retailPrice?.currencyCode === 'INR'
          ? saleInfo.retailPrice.amount
          : null;

      if (salePrice && salePrice >= 30) {
        return {
          source: 'google_books',
          newPrice: Math.round(salePrice),
          usedPrice: null,
          url: volumeInfo?.previewLink ?? '',
          lastUpdated: new Date(),
          confidence: 'high',
        };
      }
    }

    return null;
  } catch (err) {
    console.log('Google Books fetch failed:', err);
    return null;
  }
}

/**
 * Fetch from Amazon India (via unofficial API / web scraping)
 * Uses a lightweight API for book lookups
 */
async function fetchFromAmazon(title: string, isbn?: string): Promise<MarketPrice | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Using RapidAPI or similar service - adjust based on your API key
    const searchTerm = isbn ? isbn : title;
    const url = `https://amazon-price-tracker.p.rapidapi.com/search?query=${encodeURIComponent(searchTerm)}&country=IN`;
    
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'amazon-price-tracker.p.rapidapi.com',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!data.results?.[0]) return null;
    
    const item = data.results[0];
    const price = item.price;
    
    if (!price || price < 50) return null; // Books typically ₹50+
    
    return {
      source: 'amazon',
      newPrice: price,
      usedPrice: item.used_price || null,
      url: item.url || '',
      lastUpdated: new Date(),
      confidence: 'high',
    };
  } catch (err) {
    console.log('Amazon fetch failed:', err);
    return null;
  }
}

/**
 * Fetch from Open Library API (free, always available)
 * Great for ISBNs, less reliable for new pricing
 */
async function fetchFromOpenLibrary(isbn?: string): Promise<MarketPrice | null> {
  if (!isbn) return null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const url = `https://openlibrary.org/isbn/${isbn}.json`;
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) return null;
    
    const data = await res.json();
    
    // Open Library doesn't provide real-time pricing, mainly metadata
    // We'll use it for validation and book details
    return {
      source: 'open_library',
      newPrice: null,
      usedPrice: null,
      url: `https://openlibrary.org/isbn/${isbn}`,
      lastUpdated: new Date(),
      confidence: 'low', // metadata only
    };
  } catch (err) {
    console.log('Open Library fetch failed:', err);
    return null;
  }
}

/**
 * Estimate used/resale price based on market data
 * Returns what the seller should offer to buyer
 */
function estimateResalePrice(
  newPrice: number,
  condition: 'like_new' | 'good' | 'bad',
): number {
  // Market research shows typical resale rates:
  // - Like New (unopened/minimal use): 45-55% of new price
  // - Good (some wear, readable): 30-40% of new price
  // - Bad (damaged, markings, stains): 15-25% of new price
  
  const resaleMultipliers = {
    like_new: 0.50,  // 50% of new
    good: 0.35,      // 35% of new
    bad: 0.20,       // 20% of new
  };
  
  const baseResale = newPrice * resaleMultipliers[condition];
  
  // Round to nearest ₹5 for cash transactions
  return Math.round(baseResale / 5) * 5;
}

/**
 * Look up list price from Google Books only.
 * Returns the INR list price (= MRP) when found, null otherwise.
 */
export async function lookupMrpFromGoogleBooks(
  title: string,
  isbn?: string,
): Promise<number | null> {
  const result = await fetchFromGoogleBooks(title, isbn);
  return result?.newPrice ?? null;
}

/**
 * Estimate MRP when no API returns a real price.
 * Based on Indian publisher + category + class level knowledge.
 * Returns an approximate MRP and a label explaining the source.
 */
export function estimateMrp(
  title: string,
  publisher: string | null,
  subject: string | null,
  classLevel: number | null,
): { mrp: number; label: string } {
  const hay = `${title} ${publisher ?? ''} ${subject ?? ''}`.toLowerCase();

  // NCERT — government published, very cheap
  if (/ncert/.test(hay)) {
    const mrp = classLevel && classLevel <= 8 ? 55 : 75;
    return { mrp, label: 'NCERT standard price' };
  }

  // Competitive exam giants — JEE, NEET, UPSC, CA
  if (/arihant|disha|mtg\b/.test(hay) || /jee|neet|iit.jee|medical entrance|upsc|ssc\b|cat\b|gate\b/.test(hay)) {
    return { mrp: 375, label: 'Competitive prep book' };
  }

  // Cengage, Allen, Resonance, Aakash (premium coaching)
  if (/cengage|allen|resonance|aakash|fiitjee|career point/.test(hay)) {
    return { mrp: 450, label: 'Coaching material' };
  }

  // School textbooks — price by class
  if (
    /oswaal|full marks|evergreen|together with|xam idea|golden|frank|ratna sagar|together/.test(hay) ||
    (classLevel !== null)
  ) {
    if (classLevel !== null) {
      if (classLevel <= 5)  return { mrp: 110, label: `Class ${classLevel} textbook` };
      if (classLevel <= 8)  return { mrp: 160, label: `Class ${classLevel} textbook` };
      if (classLevel <= 10) return { mrp: 200, label: `Class ${classLevel} textbook` };
      if (classLevel <= 12) return { mrp: 240, label: `Class ${classLevel} textbook` };
    }
    return { mrp: 175, label: 'School textbook' };
  }

  // Engineering / university — large format, expensive
  if (
    /laxmi publications|technical publications|tata mcgraw|nirali|prentice hall/.test(hay) ||
    /engineering|mechanics|circuits|thermodynamics|operating system|data structure|compiler|network/.test(hay)
  ) {
    return { mrp: 495, label: 'Engineering textbook' };
  }

  // S. Chand — varies by level
  if (/s\.?\s*chand|schand|sultan chand/.test(hay)) {
    const mrp = classLevel ? (classLevel <= 10 ? 195 : 250) : 350;
    return { mrp, label: 'S. Chand publication' };
  }

  // Wiley, Pearson, Oxford, Cambridge — premium academic
  if (/wiley|pearson|oxford|cambridge university/.test(hay)) {
    return { mrp: 599, label: 'Premium academic text' };
  }

  // Fiction / self-help / popular publishers
  if (/penguin|harper|rupa|jaico|fingerprint|westland|hachette|bloomsbury/.test(hay)) {
    return { mrp: 299, label: 'General/fiction book' };
  }

  // Fallback by subject
  if (/physics|chemistry|biology|mathematics|history|geography|economics|political/.test(hay)) {
    return { mrp: 275, label: 'Academic subject book' };
  }

  // Default
  return { mrp: 250, label: 'Estimated price' };
}

/** @deprecated use lookupMrpFromGoogleBooks instead */
export async function getMarketData(
  title: string,
  isbn: string | undefined,
  author: string | undefined,
  condition: 'like_new' | 'good' | 'bad',
  mrp: number,
): Promise<MarketData> {
  const googleBooksPrice = await fetchFromGoogleBooks(title, isbn);
  const prices = googleBooksPrice ? [googleBooksPrice] : [];
  const averageNewPrice = googleBooksPrice?.newPrice ?? null;
  const effectiveNewPrice = averageNewPrice || Math.round(mrp * 0.95);
  const bestResaleValue = estimateResalePrice(effectiveNewPrice, condition);

  return {
    title,
    isbn,
    author,
    publisher: undefined,
    prices,
    averageNewPrice,
    averageUsedPrice: null,
    bestResaleValue,
  };
}
