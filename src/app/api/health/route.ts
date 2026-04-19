import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'kitaabvalue',
    version: '2.0.0',
    provider: process.env.OCR_PROVIDER ?? 'openai',
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasGoogleVision: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
  });
}
