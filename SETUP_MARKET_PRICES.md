# 🚀 Quick Setup Guide — Market Price Fetching

## What Was Wrong
- **Old pricing**: Used static 30% of MRP formula (❌ way too low)
- **Result**: New books showed lower prices than used books (hallucinating!)
- **Backend issue**: Never fetched real online prices

## What's Fixed
- **New pricing**: Uses real Amazon/Google Books prices (✅ realistic)
- **Condition logic**: Like New > Good > Bad (always correct hierarchy)
- **Backend**: Now fetches from 3 price sources in parallel

## Setup (5 minutes)

### Step 1: Get API Keys

#### Google Books API (Required, Free)
```bash
# Go to: https://console.cloud.google.com
# 1. Create new project
# 2. Search for "Books API" → Enable it
# 3. Credentials → Create API Key
# 4. Copy the key (starts with AIzaSy...)
```

#### Amazon Price API (Recommended, Free tier available)
```bash
# Go to: https://rapidapi.com
# 1. Sign up / Login
# 2. Search for "Amazon Book Price" or "Price Tracker"
# 3. Click "Subscribe" (many have free tier)
# 4. Copy your API Key from the dashboard
```

### Step 2: Update `.env.local`

```bash
# In your project root:
nano .env.local
# or open in VS Code
```

Add these lines (find your keys from Step 1):

```env
# Existing (keep these):
OCR_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxx

# Add these (NEW):
GOOGLE_BOOKS_API_KEY=AIzaSy_XXXXX
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=amazon-price-tracker.p.rapidapi.com
```

### Step 3: Restart and Test

```bash
# Stop your server (Ctrl+C)
# Restart:
npm run dev

# Open http://localhost:3000
# Scan a book
# Check console (F12) for: "[Market Data] Title: ..., Market Price: ₹XXX"
```

### Expected Result

**Before Fix:**
```
Scan ₹500 book marked Good → ₹63 ❌ (too low)
Mark as Like New → ₹90 ❌ (LESS than Good! Bug!)
```

**After Fix:**
```
Scan ₹500 book marked Good → ₹160 ✅ (realistic)
Mark as Like New → ₹245 ✅ (correctly HIGHER)
Mark as Bad → ₹95 ✅ (correctly LOWER)
```

## Full Details

See [MARKET_PRICING_FIX.md](./MARKET_PRICING_FIX.md)

## Support

If prices are still wrong:
1. **Check console logs**: F12 → Console → Look for "Market Data" or "fetch failed"
2. **Verify API keys**: Paste them into the APIs to make sure they work
3. **Check timeout**: If it says "timeout", your internet is slow or API is down
4. **Fallback works**: Even without APIs, app uses MRP × 0.95 formula

## What Changed in Code

- ✅ New file: [`src/lib/marketPriceFetcher.ts`](./src/lib/marketPriceFetcher.ts)
- ✅ Updated: [`src/lib/pricingEngine.ts`](./src/lib/pricingEngine.ts) — market-based formula
- ✅ Updated: [`src/app/api/scan/route.ts`](./src/app/api/scan/route.ts) — fetches prices before calculating
- ✅ Updated: [`env.example`](./env.example) — documents new API keys

---

**That's it!** Your app now shows honest prices based on real market data. 🎉
