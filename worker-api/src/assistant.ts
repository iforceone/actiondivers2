import { GoogleGenAI } from '@google/genai';

export const MAX_MESSAGE_CHARS = 2000;
const WORKERS_AI_MODEL = '@cf/google/gemma-4-26b-a4b-it';
const GEMINI_MODEL = 'gemini-3-flash-preview';

export interface AssistantEnv {
  ASSISTANT_PROVIDER?: string;
  AI?: Ai;
  GEMINI_API_KEY?: string;
}

interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Only the server can supply system instructions; bound client history and text. */
export function assistantMessages(message: string, history: unknown): AssistantMessage[] {
  const messages: AssistantMessage[] = Array.isArray(history)
    ? history
      .filter((item) => item && typeof item.content === 'string' && item.content.trim())
      .slice(-10)
      .map((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: item.content.slice(0, MAX_MESSAGE_CHARS),
      }))
    : [];

  // Discard an orphaned assistant reply after truncating history.
  while (messages[0]?.role === 'assistant') messages.shift();
  return messages.length ? messages : message ? [{ role: 'user', content: message.slice(0, MAX_MESSAGE_CHARS) }] : [];
}

export async function assistantReply(
  env: AssistantEnv,
  systemInstruction: string,
  messages: AssistantMessage[],
): Promise<string> {
  const provider = env.ASSISTANT_PROVIDER ?? 'gemini';
  let text: string | null | undefined;

  if (provider === 'workers-ai') {
    if (!env.AI) throw new Error('Workers AI binding is missing.');
    const response = await env.AI.run(WORKERS_AI_MODEL, {
      messages: [{ role: 'system', content: systemInstruction }, ...messages],
      stream: false,
      max_completion_tokens: 512,
      temperature: 0.5,
      chat_template_kwargs: { enable_thinking: false },
    });
    text = response.choices?.[0]?.message?.content;
  } else if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) throw new Error('Gemini API key is missing.');
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: messages.map(({ role, content }) => ({
        role: role === 'assistant' ? 'model' : 'user',
        parts: [{ text: content }],
      })),
      config: { systemInstruction, temperature: 0.7, topP: 0.95 },
    });
    text = response.text;
  } else {
    throw new Error('Unknown assistant provider.');
  }

  // Empty/failed generations must use the site's contact fallback, not a blank bubble.
  if (typeof text !== 'string' || !text.trim()) throw new Error('Assistant returned no text.');
  return text.trim();
}
