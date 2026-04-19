# 🔧 Troubleshooting — Market Price Fetching

## Problem: Prices Still Too Low (Like Old Behavior)

### Cause 1: Market APIs are disabled
**Check 1:** Open browser console (F12) after scanning
- ❌ You see: `[Market Lookup Failed] Error: ...`
- ✅ You see: `[Market Data] Title: ..., Market Price: ₹XXX`

**Fix:** Check `.env.local`:
```bash
# Should have these:
GOOGLE_BOOKS_API_KEY=AIzaSy...
RAPIDAPI_KEY=your_key...
```

### Cause 2: API Key Invalid
**Fix:** Test your API keys directly

#### Test Google Books API:
```bash
# Replace YOUR_KEY with your actual key
curl "https://www.googleapis.com/books/v1/volumes?q=isbn:9788177095234&key=YOUR_KEY"

# Should return JSON with book data, not error
```

#### Test RapidAPI Key:
```bash
# Replace YOUR_KEY and YOUR_HOST with actual values
curl -X GET "https://amazon-price-tracker.p.rapidapi.com/search?query=Physics&country=IN" \
  -H "X-RapidAPI-Key: YOUR_KEY" \
  -H "X-RapidAPI-Host: amazon-price-tracker.p.rapidapi.com"

# Should return JSON with book prices
```

### Cause 3: No Internet / APIs Down
**Check 1:** Browser console shows `[Market Lookup Failed] timeout`

**Check 2:** APIs are actually working
- Google Books: https://books.google.com → search "physics" → should show books
- RapidAPI: Log into https://rapidapi.com → Your dashboard → subscription should show "active"

**Fallback:** App automatically uses `MRP × 0.95` formula. You'll see conservative prices.

---

## Problem: Prices Are TOO HIGH Now

### Cause: Market price is for NEW books, not used/resale
This is **expected behavior**. Here's why:

**Example**: 
- Book MRP: ₹500
- Current market price (new) on Amazon: ₹450
- Seller offers for USED (Good condition): ₹450 × 0.38 = **₹171**

This is correct! A used book should be ~35-40% of new book price.

**To verify it's working:**
1. Scan the same book as:
   - **Like New** → Should be ₹247 (55% of ₹450)
   - **Good** → Should be ₹171 (38% of ₹450)
   - **Bad** → Should be ₹90 (20% of ₹450)

2. If these have the correct hierarchy → ✅ Working correctly!

---

## Problem: API Call Takes Too Long (8+ seconds)

### Cause 1: Slow internet
- Market fetcher waits max 8 seconds total
- If internet is slow, it times out and uses fallback

**Fix:** Nothing needed, app handles gracefully

### Cause 2: API server is slow
- Each API has 5-second timeout
- If slow, tries next one

**Fix:** Try using just Google Books:
- Modify `.env.local` to leave `RAPIDAPI_KEY` empty
- Google Books alone is usually fast (~1s)

---

## Problem: Wrong Book Detected

### Cause: OCR title is wrong

**Example:**
```
Scan book titled "Advanced Physics"
OCR extracts: "Advanced Physicist" (typo!)
Market lookup: Finds wrong book, price mismatch
```

**Fix:** If OCR is wrong:
1. App will fail to find market price
2. Falls back to `MRP × 0.95` formula
3. You enter MRP manually
4. Type the correct title in the "Detect" section

**Better fix:** Use ISBN-based lookup
- OCR should extract ISBN (13-digit number on cover)
- ISBN-based lookup is more accurate than title

Check console:
```
[Market Data] Title: ..., ISBN: 978-817...
```

If ISBN is blank, OCR couldn't read it. That's OK, title lookup still usually works.

---

## Problem: "MRP not found" Error

### This means OCR failed (not related to market pricing)

**Fix:**
1. Try rotating the book 180° and re-scanning
2. Use manual MRP entry
3. Check if OCR service is working (`OCR_PROVIDER=openai` in `.env`)

See: [Original README](./README.md#-quick-start)

---

## Problem: Frontend Still Shows Old Prices

### Cause: Browser cache

**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear cache: DevTools (F12) → Network → Disable cache (while open)
3. Sign out and clear cookies: `Ctrl+Shift+Delete` → Clear all

---

## Problem: Multiple Scans Show Different Prices

This is **expected**. Here's why:

- Scan 1: Market data fetch succeeds → realistic price
- Scan 2: Same book, but API timeout → fallback formula price

To fix: Ensure APIs are responsive
```bash
# Check API health
curl -I https://www.googleapis.com/books/v1/volumes

# Should return 200 OK
```

---

## Advanced: Enable Debug Logging

Add to `.env.local`:
```env
DEBUG=kitaabvalue:*
```

Then check console for extra logs showing exactly which API succeeded/failed.

---

## Rollback to Old Behavior (Not Recommended)

If you want the old `MRP × 0.30` formula back:

Edit [`src/lib/pricingEngine.ts`](./src/lib/pricingEngine.ts):
```typescript
// Find this line:
const newBookPrice = input.marketPrice || Math.round(mrp * 0.95);

// Change to:
const newBookPrice = input.marketPrice || Math.round(mrp * 0.30);
```

**Not recommended** because prices will be unrealistically low again.

---

## Get Help

**Problem not listed?** Check:
1. Browser console (F12 → Console)
2. Terminal logs (where `npm run dev` runs)
3. [MARKET_PRICING_FIX.md](./MARKET_PRICING_FIX.md) for detailed architecture
4. GitHub Issues (if available)

---

**Last Updated:** April 2026  
**Status:** Production Ready with Fallbacks ✅
