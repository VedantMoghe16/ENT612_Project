#!/bin/bash
# KitaabValue Market Pricing Fix — Setup Checklist
# Follow these steps to activate real market price fetching

echo "🚀 KitaabValue Market Pricing Fix Setup"
echo "======================================="
echo ""

# Step 1: Verify files
echo "Step 1: Checking files..."
if [ -f "src/lib/marketPriceFetcher.ts" ]; then
    echo "  ✅ src/lib/marketPriceFetcher.ts exists"
else
    echo "  ❌ src/lib/marketPriceFetcher.ts NOT FOUND!"
    exit 1
fi

if grep -q "getMarketData" src/app/api/scan/route.ts; then
    echo "  ✅ scan/route.ts updated with market fetcher"
else
    echo "  ❌ scan/route.ts not updated!"
    exit 1
fi

echo ""
echo "Step 2: Get API Keys (go to these URLs)..."
echo ""
echo "1️⃣  Google Books API (free)"
echo "   URL: https://console.cloud.google.com"
echo "   - Create project"
echo "   - Enable 'Books API'"
echo "   - Create API Key"
echo "   - Copy the key (starts with 'AIzaSy')"
echo ""

echo "2️⃣  RapidAPI for Amazon (free tier)"
echo "   URL: https://rapidapi.com"
echo "   - Sign up / Login"
echo "   - Search: 'Amazon book price' or 'price tracker'"
echo "   - Subscribe (free tier available)"
echo "   - Copy API key from dashboard"
echo ""

echo "Step 3: Update .env.local"
echo "   Run: nano .env.local"
echo "   Add these lines:"
echo ""
echo "   GOOGLE_BOOKS_API_KEY=AIzaSy_YOUR_KEY_HERE"
echo "   RAPIDAPI_KEY=your_rapidapi_key_here"
echo "   RAPIDAPI_HOST=amazon-price-tracker.p.rapidapi.com"
echo ""

echo "Step 4: Restart the app"
echo "   Stop: Ctrl+C"
echo "   Start: npm run dev"
echo ""

echo "Step 5: Test"
echo "   - Open http://localhost:3000"
echo "   - Scan a book"
echo "   - Open browser console (F12)"
echo "   - Look for: '[Market Data] Title: ..., Market Price: ₹XXX'"
echo "   - If you see this → ✅ SUCCESS!"
echo ""

echo "======================================="
echo "For detailed info, see:"
echo "  - SETUP_MARKET_PRICES.md (quick setup)"
echo "  - MARKET_PRICING_FIX.md (detailed tech docs)"
echo "  - TROUBLESHOOTING.md (common issues)"
echo "  - IMPLEMENTATION_SUMMARY.md (complete overview)"
echo ""
