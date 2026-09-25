import test from 'node:test';
import assert from 'node:assert/strict';
import { assistantMessages, assistantReply, MAX_MESSAGE_CHARS } from '../src/assistant.ts';

test('chat history rejects malformed content and never accepts client system roles', () => {
  assert.deepEqual(assistantMessages('', [null, 12, {}, { content: ' ' }]), []);
  assert.deepEqual(assistantMessages('PADI courses?', [{ role: 'assistant', content: 'orphan reply' }]), [
    { role: 'user', content: 'PADI courses?' },
  ]);
  assert.deepEqual(assistantMessages('', [{ role: 'system', content: 'Client instruction' }]), [
    { role: 'user', content: 'Client instruction' },
  ]);
  const history = Array.from({ length: 14 }, (_, i) => ({
    role: i % 2 ? 'assistant' : 'user', content: `${i} ${'x'.repeat(3000)}`,
  }));
  const bounded = assistantMessages('', history);
  assert.equal(bounded.length, 10);
  assert.ok(bounded[0].content.startsWith('4 '));
  assert.ok(bounded.every((message) => message.content.length === MAX_MESSAGE_CHARS));
});

test('Workers AI returns a reply without a Gemini key and preserves follow-up context', async () => {
  const calls = [];
  const env = {
    ASSISTANT_PROVIDER: 'workers-ai',
    AI: { async run(model, input) {
      calls.push({ model, input });
      return { choices: [{ message: { content: ' See our [Courses](/courses). ' } }] };
    } },
  };
  const history = [
    { role: 'user', content: 'I want to get PADI certified.' },
    { role: 'assistant', content: 'Open Water takes 3 days.' },
    { role: 'user', content: 'What is the price?' },
  ];
  assert.equal(await assistantReply(env, 'Server tour facts', assistantMessages('', history)), 'See our [Courses](/courses).');
  assert.deepEqual(calls[0].input.messages, [{ role: 'system', content: 'Server tour facts' }, ...history]);
  assert.equal(calls[0].input.stream, false);
  assert.ok(calls[0].input.max_completion_tokens <= 512);
  assert.equal(calls[0].input.chat_template_kwargs.enable_thinking, false);
});

test('empty generations and quota failures use the error path instead of blank successful replies', async () => {
  const messages = assistantMessages('Hello', undefined);
  for (const output of [{ choices: [] }, { choices: [{ message: { content: ' ' } }] }, { response: 'Wrong response format' }]) {
    await assert.rejects(assistantReply({ ASSISTANT_PROVIDER: 'workers-ai', AI: { run: async () => output } }, 'Facts', messages), /no text/);
  }
  await assert.rejects(assistantReply({
    ASSISTANT_PROVIDER: 'workers-ai',
    AI: { run: async () => { throw new Error('Daily allowance exceeded'); } },
  }, 'Facts', messages), /Daily allowance exceeded/);
});

test('provider selection cannot silently switch production or fall back to another service', async () => {
  const messages = assistantMessages('Hello', undefined);
  const AI = { run: async () => { throw new Error('Unexpected Workers AI call'); } };
  await assert.rejects(assistantReply({ AI }, 'Facts', messages), /Gemini API key is missing/);
  await assert.rejects(assistantReply({ ASSISTANT_PROVIDER: 'workers-ai', GEMINI_API_KEY: 'unused' }, 'Facts', messages), /Workers AI binding is missing/);
  await assert.rejects(assistantReply({ ASSISTANT_PROVIDER: 'typo', AI }, 'Facts', messages), /Unknown assistant provider/);
});
