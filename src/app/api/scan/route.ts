import { NextRequest, NextResponse } from 'next/server';
import { runOcr } from '@/lib/ocrProvider';
import { parseOcrText } from '@/lib/ocrParser';
import {
  calculatePrice, inferCategory,
  type AreaType, type Condition,
} from '@/lib/pricingEngine';
import { lookupMrpFromGoogleBooks, estimateMrp } from '@/lib/marketPriceFetcher';
import { lookupInDatabase } from '@/lib/bookDatabase';
import { lookupPriceFromSerper } from '@/lib/priceSearchApi';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ScanRequest {
  image?: string;
  manualMrp?: number;
  area?: AreaType;
  condition?: Condition;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScanRequest;
    const area: AreaType = body.area ?? 'normal';
    const condition: Condition = body.condition ?? 'good';

    // ─── Path A: manual MRP override ─────────────────────────────────
    if (body.manualMrp && body.manualMrp > 0 && !body.image) {
      const mrp = Math.round(body.manualMrp);
      const price = calculatePrice({ mrp, area, condition, category: 'unknown', isOutdated: false });
      return NextResponse.json({
        success: true,
        source: 'manual',
        ocr: { mrp, title: null, publisher: null, isOutdated: false, category: 'unknown' },
        price,
      });
    }

    // ─── Path B: image scan ───────────────────────────────────────────
    if (!body.image) {
      return NextResponse.json(
        { success: false, error: 'Either `image` or `manualMrp` is required.' },
        { status: 400 },
      );
    }

    // Step 1: OCR — extract book identity from cover
    let ocrResult;
    try {
      ocrResult = await runOcr(body.image);
    } catch (err: any) {
      console.error('OCR error:', err?.message);
      return NextResponse.json(
        { success: false, error: 'OCR_FAILED', message: 'Could not read the image. Please try a clearer photo.' },
        { status: 502 },
      );
    }

    const parsed  = parseOcrText(ocrResult.text);
    const s       = ocrResult.structured ?? {};

    const title     = s.title     ?? parsed.title;
    const author    = s.author    ?? null;
    const publisher = s.publisher ?? parsed.publisher;
    const subject   = s.subject   ?? null;
    const isbn      = s.isbn      ?? parsed.isbn;
    const classLevel  = s.classLevel  ?? null;
    const editionYear = s.editionYear ?? parsed.editionYear;

    // If we can't read even a title, the photo is unusable
    if (!title && !publisher) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNREADABLE',
          message: 'Could not read the book cover. Please take a clearer photo showing the title.',
        },
        { status: 200 },
      );
    }

    // Step 2: Determine MRP — five sources, best available wins
    //
    //  Priority 1: MRP explicitly printed on cover (OCR)
    //  Priority 2: Local curated database (instant, no API call)
    //  Priority 3: Serper.dev Google Shopping (real Flipkart/Amazon prices)
    //  Priority 4: Google Books saleInfo INR price
    //  Priority 5: Publisher+category smart estimation (always available)

    let mrp: number;
    let mrpSource: 'cover' | 'database' | 'serper' | 'google_books' | 'estimated';
    let mrpLabel: string;

    // Priority 1 — MRP on cover
    if (s.mrp && s.mrp >= 20 && s.mrp <= 5000) {
      mrp = s.mrp;
      mrpSource = 'cover';
      mrpLabel  = 'Read from cover';
      console.log(`[MRP] cover: ₹${mrp}`);
    }
    // Priority 2 — local database
    else if (title || publisher) {
      const dbHit = lookupInDatabase(title ?? '', publisher, subject, classLevel);
      if (dbHit) {
        mrp = dbHit.mrp;
        mrpSource = 'database';
        mrpLabel  = dbHit.label;
        console.log(`[MRP] database "${dbHit.label}": ₹${mrp}`);
      }
      // Priority 3 — Serper.dev Google Shopping (real prices)
      else {
        const serperHit = await lookupPriceFromSerper(title ?? publisher ?? '', publisher);
        if (serperHit) {
          mrp = serperHit.mrp;
          mrpSource = 'serper';
          mrpLabel  = `${serperHit.source} price`;
          console.log(`[MRP] serper (${serperHit.source}): ₹${mrp}`);
        }
        // Priority 4 — Google Books INR saleInfo
        else {
          let googleMrp: number | null = null;
          try {
            googleMrp = await lookupMrpFromGoogleBooks(title ?? publisher ?? '', isbn ?? undefined);
          } catch {}

          if (googleMrp) {
            mrp = googleMrp;
            mrpSource = 'google_books';
            mrpLabel  = 'Google Books price';
            console.log(`[MRP] google_books: ₹${mrp}`);
          }
          // Priority 5 — estimation (always works)
          else {
            const est = estimateMrp(title ?? '', publisher, subject, classLevel);
            mrp = est.mrp;
            mrpSource = 'estimated';
            mrpLabel  = est.label;
            console.log(`[MRP] estimated (${est.label}): ₹${mrp}`);
          }
        }
      }
    }
    // No title at all — fall back to estimation by publisher only
    else {
      const est = estimateMrp('', publisher, subject, classLevel);
      mrp = est.mrp;
      mrpSource = 'estimated';
      mrpLabel  = est.label;
    }

    // Step 3: Calculate price
    const isOutdated = parsed.isOutdated ||
      (editionYear !== null && (new Date().getFullYear() - editionYear) > 5);
    const category = inferCategory(title ?? '', publisher ?? undefined);
    const price = calculatePrice({ mrp, area, condition, category, isOutdated });

    return NextResponse.json({
      success: true,
      source: mrpSource,
      mrpLabel,
      ocr: {
        mrp,
        mrpSource,
        mrpLabel,
        title: title ?? null,
        author: author ?? null,
        publisher: publisher ?? null,
        subject: subject ?? null,
        editionYear,
        isOutdated,
        isbn,
        category,
        provider: ocrResult.provider,
      },
      price,
    });

  } catch (err: any) {
    console.error('Scan endpoint error:', err);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: err?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/scan',
    method: 'POST',
    body: { image: 'base64 data URL', area: 'college|normal|low_demand', condition: 'like_new|good|bad' },
  });
}
