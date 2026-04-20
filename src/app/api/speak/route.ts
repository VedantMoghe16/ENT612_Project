import { NextRequest, NextResponse } from 'next/server';

// Verified working speakers for bulbul:v2
// Using anushka (clear female voice) as a reliable default across languages
const DEFAULT_SPEAKER = 'anushka';

async function translateToLang(text: string, targetLang: string, apiKey: string): Promise<string> {
  if (targetLang === 'en-IN') return text;
  const res = await fetch('https://api.sarvam.ai/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-subscription-key': apiKey },
    body: JSON.stringify({
      input: text,
      source_language_code: 'en-IN',
      target_language_code: targetLang,
      speaker_gender: 'Female',
      mode: 'formal',
      model: 'mayura:v1',
      enable_preprocessing: false,
    }),
  });
  if (!res.ok) return text;
  const data = await res.json();
  return data.translated_text || text;
}

export async function POST(req: NextRequest) {
  const { text, targetLang } = (await req.json()) as {
    text: string;
    targetLang: string;
  };

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Missing SARVAM_API_KEY' }, { status: 500 });

  try {
    // Step 1: translate the English script to target language
    const spokenText = await translateToLang(text, targetLang, apiKey);

    // Step 2: convert to speech
    const ttsRes = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-subscription-key': apiKey },
      body: JSON.stringify({
        inputs: [spokenText],
        target_language_code: targetLang,
        speaker: DEFAULT_SPEAKER,
        pitch: 0,
        pace: 1.05,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v2',
      }),
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      return NextResponse.json({ error: err }, { status: ttsRes.status });
    }

    const data = await ttsRes.json();
    return NextResponse.json({ audio: data.audios[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
