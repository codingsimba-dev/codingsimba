import { http, HttpResponse, type HttpHandler } from "msw";
import { faker } from "@faker-js/faker";
import { z } from "zod";

const VOYAGE_URL = "https://api.voyageai.com/v1" as const;

const EmbeddingRequestSchema = z.object({
  input: z.union([z.string(), z.array(z.string())]),
  model: z.enum(["voyage-3.5", "voyage-context-3"]),
  inputType: z.enum(["query", "document"]),
});

// Generate realistic embedding vectors (1536 dimensions like typical embeddings)
function generateMockEmbedding(): number[] {
  return Array.from({ length: 1536 }, () =>
    faker.number.float({ min: -1, max: 1, fractionDigits: 6 }),
  );
}

// Mock embedding data for consistent testing
export const mockDocumentEmbeddings = [
  Array.from({ length: 1536 }, (_, i) => Math.sin(i * 0.01)),
  Array.from({ length: 1536 }, (_, i) => Math.cos(i * 0.01)),
  Array.from(
    { length: 1536 },
    (_, i) => Math.sin(i * 0.02) * Math.cos(i * 0.01),
  ),
];

export const mockQueryEmbedding = Array.from(
  { length: 1536 },
  (_, i) => Math.sin(i * 0.005) * Math.cos(i * 0.003),
);

export const handlers: HttpHandler[] = [
  http.post(`${VOYAGE_URL}/contextualizedembeddings`, async ({ request }) => {
    const body = EmbeddingRequestSchema.parse(await request.json());
    console.info("Mocked VoyageAI embedding request:", {
      model: body.model,
      inputType: body.inputType,
      inputCount: Array.isArray(body.input) ? body.input.length : 1,
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const data = (body.input as string[]).map((_, index) => ({
      object: "embedding",
      embedding:
        mockDocumentEmbeddings[index % mockDocumentEmbeddings.length] ||
        generateMockEmbedding(),
      index,
    }));

    return HttpResponse.json({
      object: "list",
      data,
      model: body.model,
      usage: {
        total_tokens: faker.number.int({ min: 100, max: 1000 }),
      },
    });
  }),

  http.post(`${VOYAGE_URL}/embedding`, async ({ request }) => {
    const body = EmbeddingRequestSchema.parse(await request.json());
    console.info("Mocked VoyageAI embedding request:", {
      model: body.model,
      inputType: body.inputType,
      inputCount: Array.isArray(body.input) ? body.input.length : 1,
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const data = [
      {
        object: "embedding",
        embedding: mockQueryEmbedding,
        index: 0,
      },
    ];

    return HttpResponse.json({
      object: "list",
      data,
      model: body.model,
      usage: {
        total_tokens: faker.number.int({ min: 100, max: 1000 }),
      },
    });
  }),
];
