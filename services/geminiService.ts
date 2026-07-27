import { API } from '../config';

const FALLBACK =
  "I apologize, my connection to the mainland is slightly interrupted. Please contact us directly at 011-501-671-2624 for immediate assistance.";

/**
 * Ask the Tour Assistant.
 *
 * The Gemini call happens in the site API Worker (see /worker-api), not here —
 * the API key must never reach the browser. The system prompt and model choice
 * live there too, so this only ships the guest's message.
 */
export async function getAssistantResponse(message: string): Promise<string> {
  if (!API.isConfigured()) {
    console.warn('Assistant endpoint not configured; set apiBaseUrl in config.ts');
    return FALLBACK;
  }

  try {
    const res = await fetch(API.url('/assistant'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; text?: string; error?: string }
      | null;

    if (!res.ok || !data?.ok) {
      // 429 is the one case worth wording differently — nothing is broken.
      if (res.status === 429) {
        return "I'm getting a lot of questions right now. Give me a moment and try again.";
      }
      console.error('Assistant request failed:', res.status, data?.error ?? '');
      return FALLBACK;
    }

    return data.text?.trim() || FALLBACK;
  } catch (error) {
    console.error('Assistant network error:', error);
    return FALLBACK;
  }
}
