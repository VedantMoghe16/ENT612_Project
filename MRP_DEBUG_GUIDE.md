# 🔍 MRP Detection Debugging Guide

## What I Fixed

1. **Improved OCR Prompt** - Now explicitly tells OpenAI Vision to look EVERYWHERE for prices
2. **Better Fallback Parser** - Added aggressive price detection patterns + fallback to find any number that looks like a price
3. **Added Debug Logging** - Terminal will now show exactly what OCR extracted and why MRP wasn't found

---

## How to Test

### Step 1: Start Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### Step 2: Scan a Book
1. Go to http://localhost:3000
2. Upload a clear image of a book cover/back cover showing the MRP
3. **Make sure the MRP/price is visible in the image**

### Step 3: Check Terminal Logs
Look for this output in your terminal:
```
OCR Results: {
  provider: 'openai',
  text_length: 1234,
  structured_mrp: 450,           ← If this is filled, ✅ MRP detected
  parsed_mrp: 450,
  final_mrp: 450,
  title: 'Physics...',
  mrp_confidence: 'high'
}
```

---

## If MRP Still Not Detected

### Check 1: Is the Image Clear?
- MRP must be **visible** and **readable** in the image
- Try: Back cover, barcode area, or printed price box
- Avoid: Blurry, small, or obscured prices

### Check 2: Check Terminal Output
If you see:
```
MRP not detected. Structured: null, Parsed: null
```

This means **neither OpenAI nor the fallback parser found a price**.

### Check 3: See What OpenAI Extracted
In the response (browser F12 > Network > scan API response), look for:
```json
{
  "success": false,
  "ocr": {
    "text": "...all OCR text here...",
    "mrp_attempts": {
      "structured": null,
      "parsed": null
    }
  }
}
```

The `text` field shows what OpenAI saw. If the price isn't there, the OCR failed.

---

## Common Issues & Fixes

### Issue 1: "MRP ₹450" is visible but not detected

**Likely cause**: Image quality or angle

**Fixes**:
- Take a straight-on photo (not at an angle)
- Make sure the price is in focus
- Try different parts of the book (front, back, spine)

### Issue 2: OpenAI textracted wrong MRP

**Example**: Book shows ₹450 but detected as ₹4500

**Fix**: The new OCR prompt is more careful, but you can also manually enter the MRP using the "Enter MRP Manually" button on the app.

### Issue 3: All API keys look correct but prices not showing

Check if:
1. `.env.local` has `GOOGLE_BOOKS_API_KEY=AIzaSy...` (not empty)
2. `.env.local` has `RAPIDAPI_KEY=...` (not empty)
3. Server was restarted after adding keys

### Issue 4: Terminal shows "Market Lookup Failed"

This is OK! It means:
- MRP was detected ✅
- Market price fetch failed (API timeout, wrong key format) ⚠️
- App falls back to using MRP formula ✅

You'll still get a price, just not market-adjusted.

---

## How MRP Detection Works (3-Step Flow)

```
Step 1: Take Book Photo
  ↓
Step 2: Send to OpenAI Vision
  ├─ OpenAI extracts ALL text
  ├─ Looks specifically for prices (MRP ₹XXX, Rs. XXX, etc.)
  └─ Returns JSON with mrp field
  ↓
Step 3: Fallback Parser (if OpenAI failed)
  ├─ Looks for currency symbols (₹, Rs., INR)
  ├─ Looks for common patterns (M.R.P., Price:, etc.)
  └─ Falls back to finding any realistic price number
  ↓
Final Result:
  If MRP found → Show price calculation
  If MRP NOT found → Ask user to enter manually
```

---

## Temporary Workaround

If OCR keeps failing:

1. Read the MRP from the book yourself
2. Click "Enter MRP Manually" in the app
3. The system will:
   - Calculate fair resale price
   - Fetch real market prices from Amazon/Google Books
   - Show you realistic pricing

This still works great — MRP detection is just a convenience feature.

---

## Advanced: Test API Directly

### Test OpenAI Vision (the OCR)
```bash
# Log into https://platform.openai.com/playground
# Upload the same book image
# See what text it extracts
# If it doesn't see the price → OCR limitation, try better image
```

### Test Google Books API
```bash
# If you have a book title, test:
curl "https://www.googleapis.com/books/v1/volumes?q=Physics&key=YOUR_KEY"

# Should return book data with prices
```

### Test RapidAPI
```bash
# Go to https://rapidapi.com
# Find your API dashboard
# Test the endpoint with a book title
# Make sure it returns prices
```

---

## Summary of Fixes

| What | Before | After |
|------|--------|-------|
| OCR instruction | Generic | Specific: "look EVERYWHERE for price" |
| Fallback patterns | 3 patterns | 6+ patterns + any-price fallback |
| Error messages | Silent | Shows what was tried |
| User experience | Confusing ("why isn't it working?") | Clear ("image not showing price clearly") |

---

## Next Steps

1. **Restart server**: `npm run dev`
2. **Test with a clear book image** showing the MRP
3. **Check terminal output** for OCR Results
4. **If still failing**: Screenshot terminal output and debug based on Issue section above

The system now **aggressively** looks for prices — if it still can't find one, it's likely an image quality issue, not the code.

---

## Questions?

Check the terminal logs first — they now tell you exactly what happened during MRP detection! 🔍
