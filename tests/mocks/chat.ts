import { http, HttpResponse, type HttpHandler } from "msw";
import { faker } from "@faker-js/faker";

// Mock conversation storage
const mockConversations = new Map<
  string,
  Array<{
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
  }>
>();

function generateMockAIResponse(): string {
  const responses = [
    `Great question! Here's a detailed explanation: ${faker.lorem.paragraph()}`,
    `I understand you're asking about this. Let me break it down: ${faker.lorem.paragraph()}`,
    `That's an interesting point. Here's what you should know: ${faker.lorem.paragraph()}`,
    `Based on your question, here's the answer: ${faker.lorem.paragraph()}`,
    `Let me help you understand this better: ${faker.lorem.paragraph()}`,
  ];

  return faker.helpers.arrayElement(responses);
}

export const handlers: HttpHandler[] = [
  http.post("/chatbot", async ({ request }) => {
    try {
      const formData = await request.formData();
      const question = formData.get("question") as string;
      const documentId = formData.get("documentId") as string;

      if (!question) {
        return HttpResponse.json(
          { answer: null, error: "Question is required" },
          { status: 400 },
        );
      }

      // Simulate processing delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000),
      );

      // Generate mock AI response in JSON format (simulating the real AI response)
      const aiResponseJson = {
        answer: generateMockAIResponse(),
        sources: [
          {
            index: 0,
            document: "React Documentation",
            similarity: 0.95,
            content: faker.lorem.sentence(),
            metadata: { title: "React Hooks Guide" },
          },
          {
            index: 1,
            document: "JavaScript Tutorial",
            similarity: 0.87,
            content: faker.lorem.sentence(),
            metadata: { title: "Modern JavaScript" },
          },
        ],
        confidence: faker.number.float({
          min: 0.7,
          max: 0.99,
          fractionDigits: 2,
        }),
      };

      // Store in mock conversation (simulating database)
      const conversationKey = `${documentId || "general"}`;
      if (!mockConversations.has(conversationKey)) {
        mockConversations.set(conversationKey, []);
      }

      const conversation = mockConversations.get(conversationKey)!;
      conversation.push({
        role: "user",
        content: question,
        createdAt: new Date(),
      });
      conversation.push({
        role: "assistant",
        content: aiResponseJson.answer,
        createdAt: new Date(),
      });

      // Convert JSON to markdown (simulating json2md conversion)
      const mdxResponse = `# AI Response\n\n${aiResponseJson.answer}\n\n## Sources\n\n${aiResponseJson.sources.map((source) => `- **${source.document}** (${Math.round(source.similarity * 100)}% match)\n  ${source.content}`).join("\n")}\n\n## Confidence\n\n${Math.round(aiResponseJson.confidence * 100)}% confident in this response.`;

      console.log(
        `🤖 Chatbot: Question "${question.substring(0, 50)}..." → Response generated`,
      );

      return HttpResponse.json({
        answer: mdxResponse,
        error: null,
      });
    } catch (error) {
      console.error("Chatbot mock error:", error);
      return HttpResponse.json(
        { answer: null, error: "Internal server error" },
        { status: 500 },
      );
    }
  }),
];

// Helper functions for testing
export function clearMockConversations(): void {
  mockConversations.clear();
  console.log("🧹 Chatbot: Mock conversations cleared");
}

export function getMockConversations() {
  return Object.fromEntries(mockConversations);
}
