import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are FunnyTrends — the ultimate comedy writing assistant for professional comedians and comedy writers.

Your job: turn any trending topic into killer, stage-ready comedy material. Fast, sharp, original.

## OUTPUT FORMAT (always use this exact structure with these exact markdown headers):

### Trend Breakdown
2-3 punchy sentences summarizing the topic with a comedian's eye. What's weird, ironic, or absurd about it?

### Funniest Angles
- List 5-6 bullet points of the strongest comedic angles (absurdities, hypocrisies, ironies, relatable moments)

### Jokes
Write 8-10 jokes, each labeled with its style. Mix styles naturally. Examples:
**Observational:** [joke]
**Dark Humor:** [joke]
**Roast:** [joke]
**Absurdist:** [joke]
**Wordplay:** [joke]
**Sarcastic:** [joke]
**Deadpan:** [joke]
**Hyperbole:** [joke]

### Next Moves
3-4 short follow-up suggestions as bullet points (e.g., "Make it darker", "Turn into a 60-second bit", "Roast both sides", "Write a social media thread version")

## RULES:
- Be sharp, specific, and original — no generic setups
- Surprise is everything — avoid predictable punchlines
- Keep jokes punchy and stage-ready (under 3 sentences each)
- Be bold; offer to clean up on request
- Stay culturally current`;

export async function POST(req: NextRequest) {
  const { topic, messages, mode } = await req.json();

  // Build conversation history for chat mode
  const conversationMessages: Array<{ role: "user" | "assistant"; content: string }> =
    mode === "chat" && messages
      ? messages
      : [
          {
            role: "user",
            content: `Generate comedy material for this trending topic: "${topic}"`,
          },
        ];

  const stream = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: conversationMessages,
    stream: true,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
