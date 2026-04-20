import { NextRequest, NextResponse } from 'next/server';

const CONCURRENCY = 8;

async function translateOne(text: string, targetLang: string, apiKey: string): Promise<string> {
  if (!text.trim()) return text;
  const res = await fetch('https://api.sarvam.ai/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey,
    },
    body: JSON.stringify({
      input: text,
      source_language_code: 'en-IN',
      target_language_code: targetLang,
      speaker_gender: 'Male',
      mode: 'formal',
      model: 'mayura:v1',
      enable_preprocessing: false,
    }),
  });
  if (!res.ok) return text;
  const data = await res.json();
  return (data.translated_text as string) || text;
}

// Run tasks with a max concurrency cap to avoid rate limits
async function pool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const i = cursor++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

export async function POST(req: NextRequest) {
  const { strings, targetLang } = (await req.json()) as {
    strings: string[];
    targetLang: string;
  };

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing SARVAM_API_KEY' }, { status: 500 });
  }

  try {
    const translated = await pool(
      strings.map(s => () => translateOne(s, targetLang, apiKey)),
      CONCURRENCY,
    );
    return NextResponse.json({ translated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
