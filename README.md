# 📖 KitaabValue v2.0

> **Scan any Indian textbook → Get instant fair price → Sell smarter.**
> Built for *kabaadiwalas*, scrap-book dealers, and buyback shops.

A production-grade Next.js web app that uses real OCR (OpenAI Vision or Google Cloud Vision) to read the MRP printed on a book cover, then runs it through a locality-adjusted pricing engine to produce a **SELL / MAYBE / SCRAP** verdict.

UI inspired by [ScrapUncle](https://scrapuncle.com/) — clean white, trustworthy green, zero clutter.

---

## ⚡ Quick Start

```bash
# 1. Install
npm install

# 2. Add your API key
cp .env.example .env.local
# edit .env.local and paste OPENAI_API_KEY=sk-...

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → upload a book cover → get a price.

---

## 🏗 Architecture

```
┌─────────────┐   base64    ┌──────────────┐   MRP + title   ┌────────────────┐
│   Browser   │ ──────────> │  /api/scan   │ ─────────────> │ Pricing Engine │
│  (Scanner)  │             │   Next.js    │                 │  (TypeScript)  │
└─────────────┘             │              │                 └────────┬───────┘
       ▲                    │  1. OCR      │                          │
       │                    │  2. Parse    │                          │
       │    SRP + Verdict   │  3. Price    │ <────────────────────────┘
       └────────────────────┤              │
                            └──────┬───────┘
                                   │
                          ┌────────┴────────┐
                          ▼                 ▼
                   ┌────────────┐    ┌─────────────┐
                   │   OpenAI   │    │   Google    │
                   │   Vision   │    │Cloud Vision │
                   └────────────┘    └─────────────┘
```

**Data flow** (per the brief):
`Image → Vision API → Parsed JSON (MRP, Title, Publisher) → Pricing Engine → Final SRP + Verdict → UI`

---

## 📁 Project Structure

```
kitaabvalue/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/route.ts       ← main endpoint: image → price
│   │   │   └── health/route.ts     ← diagnostics
│   │   ├── globals.css             ← Tailwind + custom CSS (scan-laser etc.)
│   │   ├── layout.tsx              ← fonts + metadata
│   │   └── page.tsx                ← main app state machine
│   │
│   ├── components/
│   │   ├── Header.tsx              ← sticky top bar + area selector
│   │   ├── Scanner.tsx             ← upload/camera + scan animation
│   │   ├── ResultCard.tsx          ← verdict card + breakdown
│   │   └── ManualMrpEntry.tsx      ← fallback when OCR fails
│   │
│   └── lib/
│       ├── pricingEngine.ts        ← the formula (Base = MRP × 0.30)
│       ├── ocrParser.ts            ← regex extraction for MRP/title/publisher
│       └── ocrProvider.ts          ← OpenAI + Google adapters
│
├── .env.example                    ← copy to .env.local and fill in
├── next.config.js
├── tailwind.config.ts              ← brand colors + animations
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## 🔑 Configuration

### Option A — OpenAI Vision (recommended)

Faster to set up, and *more accurate* for this use case because `gpt-4o-mini` can OCR **and** extract structured fields (MRP, title, publisher) in one call via JSON mode.

```env
OCR_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

**Cost:** ~$0.003 per scan (gpt-4o-mini, 1 image + structured JSON response).

### Option B — Google Cloud Vision

Use this if you already have GCP credentials or need enterprise SLAs.

1. Create a service account in [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Cloud Vision API**
3. Download the service account JSON
4. Paste it as a single-line string:

```env
OCR_PROVIDER=google
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"...",...}
```

**Cost:** First 1000 images/month free, then $1.50 per 1000.

---

## 🧮 The Pricing Formula

```
Base Price    = MRP × 0.30                     ← 30% of printed MRP
Final Price   = Base × Area × Condition × Category × Edition
              (rounded to nearest ₹5)

Verdict thresholds:
  ≥ ₹40   →  SELL    (green)
  ₹15–39  →  MAYBE   (yellow)
  < ₹15   →  SCRAP   (red)
```

### Multiplier tables

| Area          | Mul  | Use case                                      |
|---------------|------|-----------------------------------------------|
| College       | 0.60 | Near campus, hostels — highest resale demand  |
| Normal        | 0.40 | Standard residential / mixed neighborhoods    |
| Low Demand    | 0.25 | Rural / scrap-only                            |

| Condition | Mul  |
|-----------|------|
| Like New  | 1.00 |
| Good      | 0.70 |
| Bad       | 0.40 |

| Category     | Mul  | Detected from              |
|--------------|------|----------------------------|
| Competitive  | 1.20 | Arihant, Disha, HC Verma, JEE, NEET… |
| Academic     | 1.00 | Engineering/college texts  |
| School       | 0.85 | NCERT, CBSE, ICSE          |
| Fiction      | 0.75 | Novels, self-help          |
| Old Edition  | 0.50 | >5 years old (from year on cover) |

### Worked example

A used *HC Verma Physics* (MRP ₹450, competitive, good condition, near a college):

```
Base     = 450 × 0.30  = ₹135
Area     × 0.60 (college)
Condition× 0.70 (good)
Category × 1.20 (competitive)
Edition  × 1.00
────────────────────────────────
Final    = 135 × 0.60 × 0.70 × 1.20 = ₹68.04 → ₹70
Verdict  = SELL  ✅
```

---

## 🌐 API Reference

### `POST /api/scan`

**Request (with image):**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
  "area": "normal",
  "condition": "good"
}
```

**Request (manual MRP fallback):**
```json
{
  "manualMrp": 450,
  "area": "college",
  "condition": "good"
}
```

**Success response:**
```json
{
  "success": true,
  "source": "ocr",
  "ocr": {
    "text": "raw OCR text...",
    "mrp": 450,
    "mrpConfidence": "high",
    "title": "Concepts of Physics",
    "publisher": "Bharati Bhawan",
    "editionYear": 2022,
    "isOutdated": false,
    "isbn": "9788177092325",
    "category": "competitive",
    "provider": "openai"
  },
  "price": {
    "mrp": 450,
    "basePrice": 135,
    "areaMultiplier": 0.4,
    "conditionMultiplier": 0.7,
    "categoryMultiplier": 1.2,
    "editionMultiplier": 1.0,
    "finalPrice": 45,
    "verdict": "SELL",
    "verdictLabel": "SELL",
    "verdictReason": "Good resale value — accept this book."
  }
}
```

**Fallback response** (OCR couldn't find MRP):
```json
{
  "success": false,
  "error": "MRP_NOT_FOUND",
  "message": "Could not detect MRP on this book. Please enter it manually.",
  "requiresManualMrp": true,
  "ocr": { "title": "...", "text": "..." }
}
```

The frontend handles this by showing the `ManualMrpEntry` modal.

### `GET /api/health`

Returns status + which OCR provider is configured.

---

## 🎨 UI / UX Highlights

Inspired by [ScrapUncle](https://scrapuncle.com/)'s clean, trustworthy aesthetic:

- **Colors:** white + off-gray backgrounds, `#10b981` brand green, amber for "MAYBE", red for "SCRAP"
- **Fonts:** Poppins (display/numbers) + Inter (body) — both modern, highly legible
- **Cards:** soft shadows, `rounded-3xl`, generous whitespace
- **Animations:**
  - Scanning laser line sweeps over the uploaded image
  - Corner brackets appear around the book during OCR
  - Price animates up from 0 with a cubic ease-out
  - Fade-up entrance on cards
  - Pulse ring on the "scanning" indicator
  - Button tap-scale feedback
- **Mobile-first:** Max-width 576px centered, works beautifully as a PWA-ready web app on phones

---

## 🚀 Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Then in the Vercel dashboard:
1. Go to **Settings → Environment Variables**
2. Add `OCR_PROVIDER` = `openai`
3. Add `OPENAI_API_KEY` = `sk-...`
4. Redeploy

The `/api/scan` route is already configured with `maxDuration: 30` (needed for Vision API calls).

### AWS / self-host

Works on any platform that runs Node.js 18+:

```bash
npm run build
npm start        # starts on port 3000
```

For Docker, use `node:20-alpine` and expose 3000.

---

## 🧪 Testing the Pipeline

**1. Test with a real book cover:**
- Open the app
- Click Camera → point at any book's back cover (where "M.R.P. Rs. 450" is printed)
- Get a verdict in 2–3 seconds

**2. Test the fallback:**
- Upload a book cover with no visible MRP (front cover only)
- You should see the manual MRP modal
- Enter ₹450 → get a price

**3. Test the health endpoint:**
```bash
curl http://localhost:3000/api/health
```

**4. Test the API directly:**
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"manualMrp": 450, "area": "college", "condition": "good"}'
```

---

## 🛣 Roadmap (future work)

- [ ] ISBN barcode scanner (use `@zxing/browser`)
- [ ] Scrape live prices from Amazon/Flipkart as a reality-check
- [ ] Offline mode: cache the top-500 Indian textbooks locally
- [ ] Inventory management: track scanned books, generate daily/weekly reports
- [ ] Multi-language OCR (Hindi, Tamil, Bengali book titles)
- [ ] Share feature: WhatsApp the verdict card to the seller
- [ ] Analytics dashboard: which books earn the most per dealer

---

## 📄 License

Built for **ENT612** coursework. Free to use, fork, and extend.
