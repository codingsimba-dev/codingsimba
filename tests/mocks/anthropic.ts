import { http, HttpResponse, type HttpHandler } from "msw";
import { faker } from "@faker-js/faker";
import { z } from "zod";

const ANTHROPIC_URL = "https://api.anthropic.com/v1";

const MessageRequestSchema = z.object({
  model: z.enum(["claude-3-5-haiku-latest", "claude-sonnet-4-20250514"]),
  max_tokens: z.number(),
  temperature: z.number().optional(),
  system: z
    .array(
      z.object({
        type: z.literal("text"),
        text: z.string(),
        cache_control: z.object({ type: z.literal("ephemeral") }).optional(),
      }),
    )
    .optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.union([
        z.string(),
        z.array(
          z.object({
            type: z.literal("text"),
            text: z.string(),
            cache_control: z
              .object({ type: z.literal("ephemeral") })
              .optional(),
          }),
        ),
      ]),
    }),
  ),
  thinking: z
    .object({
      type: z.literal("enabled"),
      budget_tokens: z.number(),
    })
    .optional(),
  tools: z
    .array(
      z.object({
        type: z.literal("web_search_20250305"),
        name: z.literal("web_search"),
        max_uses: z.number(),
      }),
    )
    .optional(),
});

// Mock responses that match your actual streaming format
export const mockStreamingResponses = {
  simple: [
    JSON.stringify({
      type: "message_start",
      data: {
        messageId: "msg_123",
        model: "claude-3-5-haiku-latest",
      },
    }),
    JSON.stringify({
      type: "text_delta",
      data: "Hello! ",
    }),
    JSON.stringify({
      type: "text_delta",
      data: "How can ",
    }),
    JSON.stringify({
      type: "text_delta",
      data: "I help you today?",
    }),
    JSON.stringify({
      type: "message_delta",
      data: { stop_reason: "end_turn", stop_sequence: null },
      metadata: {
        inputTokens: 50,
        outputTokens: 25,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 10,
        totalTokens: 85,
        learningMode: "default",
        userLevel: "intermediate",
        urgency: "medium",
        complexity: "simple",
      },
    }),
  ],

  thinking: [
    JSON.stringify({
      type: "message_start",
      data: {
        messageId: "msg_456",
        model: "claude-sonnet-4-20250514",
      },
    }),
    JSON.stringify({
      type: "thinking",
      data: "",
    }),
    JSON.stringify({
      type: "thinking_delta",
      data: "Let me think about this problem...",
    }),
    JSON.stringify({
      type: "thinking_delta",
      data: " This requires careful analysis...",
    }),
    JSON.stringify({
      type: "text_delta",
      data: "Based on my analysis, ",
    }),
    JSON.stringify({
      type: "text_delta",
      data: "the best approach would be...",
    }),
    JSON.stringify({
      type: "message_delta",
      data: { stop_reason: "end_turn", stop_sequence: null },
      metadata: {
        inputTokens: 150,
        outputTokens: 75,
        cacheCreationInputTokens: 20,
        cacheReadInputTokens: 30,
        totalTokens: 275,
        learningMode: "system-design",
        userLevel: "advanced",
        urgency: "medium",
        complexity: "complex",
      },
    }),
  ],

  web_search: [
    JSON.stringify({
      type: "message_start",
      data: {
        messageId: "msg_search",
        model: "claude-sonnet-4-20250514",
      },
    }),
    // Web search tool usage - signature delta
    JSON.stringify({
      type: "signature_delta",
      data: '{"query": "latest React 19 features"}',
    }),
    // Response after search
    JSON.stringify({
      type: "text_delta",
      data: "Based on the latest information, ",
    }),
    JSON.stringify({
      type: "text_delta",
      data: "React 19 introduces several new features including concurrent features, automatic batching, and improved Suspense support...",
    }),
    JSON.stringify({
      type: "message_delta",
      data: { stop_reason: "end_turn", stop_sequence: null },
      metadata: {
        inputTokens: 100,
        outputTokens: 80,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 15,
        totalTokens: 195,
        learningMode: "create-tutorial",
        userLevel: "intermediate",
        urgency: "medium",
        complexity: "simple",
      },
    }),
  ],

  complex: [
    JSON.stringify({
      type: "message_start",
      data: {
        messageId: "msg_789",
        model: "claude-sonnet-4-20250514",
      },
    }),
    JSON.stringify({
      type: "text_delta",
      data: "This is a complex system design question. ",
    }),
    JSON.stringify({
      type: "text_delta",
      data: "Let me break it down into components:\n\n",
    }),
    JSON.stringify({
      type: "text_delta",
      data: "1. **Database Architecture**\n   - Consider sharding strategies\n   - Plan for read replicas\n\n",
    }),
    JSON.stringify({
      type: "text_delta",
      data: "2. **API Design**\n   - RESTful endpoints\n   - Rate limiting considerations\n\n",
    }),
    JSON.stringify({
      type: "text_delta",
      data: "3. **Scalability Considerations**\n   - Horizontal vs vertical scaling\n   - Caching strategies\n",
    }),
    JSON.stringify({
      type: "message_delta",
      data: { stop_reason: "end_turn", stop_sequence: null },
      metadata: {
        inputTokens: 200,
        outputTokens: 150,
        cacheCreationInputTokens: 50,
        cacheReadInputTokens: 25,
        totalTokens: 425,
        learningMode: "system-design",
        userLevel: "advanced",
        urgency: "low",
        complexity: "complex",
      },
    }),
  ],

  error: [
    JSON.stringify({
      type: "error",
      data: {
        type: "rate_limit_error",
        message: "Rate limit exceeded. Please try again later.",
      },
    }),
  ],
};

export const handlers: HttpHandler[] = [
  // Main streaming endpoint
  http.post(`${ANTHROPIC_URL}/messages`, async ({ request }) => {
    try {
      const body = MessageRequestSchema.parse(await request.json());
      console.info("Mocked Anthropic messages request:", {
        model: body.model,
        messageCount: body.messages.length,
        hasThinking: !!body.thinking,
        hasTools: !!body.tools,
        systemPromptLength: body.system?.[0]?.text.length || 0,
        temperature: body.temperature,
        maxTokens: body.max_tokens,
      });

      // Simulate processing delay
      await new Promise((resolve) =>
        setTimeout(resolve, faker.number.int({ min: 100, max: 300 })),
      );

      // Determine response type based on request characteristics
      let responseType = "simple";

      if (body.thinking) {
        responseType = "thinking";
      } else if (body.tools?.some((tool) => tool.name === "web_search")) {
        responseType = "web_search";
      } else if (
        body.model === "claude-sonnet-4-20250514" ||
        body.messages.some((msg) =>
          typeof msg.content === "string"
            ? msg.content.length > 200
            : msg.content.some((block) => block.text.length > 200),
        )
      ) {
        responseType = "complex";
      }

      const mockChunks =
        mockStreamingResponses[
          responseType as keyof typeof mockStreamingResponses
        ];

      const stream = new ReadableStream({
        start(controller) {
          let index = 0;

          const sendNext = () => {
            if (index < mockChunks.length) {
              controller.enqueue(mockChunks[index]);
              index++;

              // Variable delay between chunks to simulate realistic streaming
              setTimeout(sendNext, faker.number.int({ min: 50, max: 200 }));
            } else {
              controller.close();
            }
          };

          // Start sending chunks after a brief delay
          setTimeout(sendNext, faker.number.int({ min: 50, max: 150 }));
        },
      });

      return new HttpResponse(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Mock request validation failed:", error);
      return HttpResponse.json(
        {
          type: "error",
          error: {
            type: "invalid_request_error",
            message: "Invalid request format in mock",
          },
        },
        { status: 400 },
      );
    }
  }),

  http.post(`${ANTHROPIC_URL}/messages-error`, async () => {
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(mockStreamingResponses.error[0]);
        controller.close();
      },
    });

    return new HttpResponse(errorStream, {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  }),

  http.post(`${ANTHROPIC_URL}/messages-rate-limit`, async () => {
    return HttpResponse.json(
      {
        type: "error",
        error: {
          type: "rate_limit_error",
          message: "Rate limit exceeded. Please try again later.",
        },
      },
      { status: 429 },
    );
  }),

  http.get(`${ANTHROPIC_URL}/health`, () => {
    return HttpResponse.json({ status: "ok", timestamp: Date.now() });
  }),
];
