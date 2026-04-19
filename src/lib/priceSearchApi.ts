/**
 * Real-time Indian book price lookup via Serper.dev Google Shopping API.
 *
 * Sign up at https://serper.dev — 2,500 free searches, then ~$0.001/search.
 * Set SERPER_API_KEY in your environment.
 *
 * Why Serper.dev: it searches Google Shopping India (IN) which aggregates
 * real-time prices from Flipkart, Amazon India, and other retailers.
 */

interface SerperShoppingItem {
  title: string;
  source: string;
  link: string;
  price?: string;        // e.g. "₹450" or "Rs. 450"
  priceNumeric?: number;
  currency?: string;
}

function parseRupeePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  // strip currency symbols, commas, spaces
  const cleaned = raw.replace(/[₹Rs.,\s]/gi, '').trim();
  const n = parseInt(cleaned, 10);
  return !isNaN(n) && n >= 20 && n <= 8000 ? n : null;
}

export async function lookupPriceFromSerper(
  title: string,
  publisher: string | null,
): Promise<{ mrp: number; source: string } | null> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // Build query: title + publisher for specificity, site:flipkart.com as signal
    const query = [title, publisher].filter(Boolean).join(' ') + ' price india';

    const res = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, gl: 'in', hl: 'en', num: 10 }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.log('Serper API error:', res.status);
      return null;
    }

    const data = await res.json();
    const items: SerperShoppingItem[] = data.shopping ?? [];

    if (items.length === 0) return null;

    // Collect all valid prices from results
    const prices: { price: number; source: string }[] = [];
    for (const item of items) {
      const p = item.priceNumeric ?? parseRupeePrice(item.price ?? '');
      if (p && p >= 20 && p <= 8000) {
        prices.push({ price: p, source: item.source ?? 'Shopping' });
      }
    }

    if (prices.length === 0) return null;

    // Sort by price descending — the highest price is most likely the
    // actual MRP (discounted prices are lower). Use the median to avoid
    // outliers if several results exist.
    prices.sort((a, b) => b.price - a.price);
    const pick = prices[Math.floor(prices.length * 0.25)] ?? prices[0]; // ~75th percentile

    console.log(`Serper price for "${title}": ₹${pick.price} (${pick.source})`);
    return { mrp: pick.price, source: pick.source };
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      console.log('Serper lookup failed:', err?.message);
    }
    return null;
  }
}
