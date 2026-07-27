import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function generateForensicHint(
  prompt: string,
  fallback: string
): Promise<string> {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return fallback;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return response.text?.trim() || fallback;
  } catch (err) {
    console.error('Gemini hint generation error:', err);
    return fallback;
  }
}
