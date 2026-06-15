import { apiHandler } from '@/lib/errors/api-handler';
import OpenAI from 'openai';
import { getTenantId } from '@/lib/auth';
import { getInboxMessages } from '@/features/mail/server/gmail-service';
import { UnauthorizedError, InternalServerError } from '@/lib/errors/errors';

/**
 * GET /api/ai/inbox-summary
 * Returns a summary of the user's inbox using OpenAI.
 */
export const GET = apiHandler(async () => {
  const tenantId = await getTenantId();
  if (!tenantId) {
    throw new UnauthorizedError('Not authenticated');
  }

  const messages = await getInboxMessages(tenantId);

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new InternalServerError('OpenAI API key not configured');
  }

  const openai = new OpenAI({
    apiKey: openaiApiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Briefly',
    },
  });

  const emailsText = messages
    .map((msg, index) => `Email ${index + 1}:\n- Subject: ${msg.subject}\n- From: ${msg.from}\n- Snippet: ${msg.snippet}\n`)
    .join('\n');

  const systemPrompt = `You are Briefly AI, an executive assistant focused on email, calendar, and productivity.\nSummarize the user's inbox, highlighting important emails, key topics, and any action items. Be concise and organized.`;

  const userPrompt = `Here are the user's recent emails:\n${emailsText}\n\nPlease provide a summary of the inbox, highlighting:\n1. Important emails\n2. Key topics\n3. Action items\n4. Any urgent messages`;

  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = completion.choices[0].message.content || "I'm sorry, I couldn't generate a summary.";
  return { summary: content, messages: messages.length };
});
