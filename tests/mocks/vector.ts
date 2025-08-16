import { http, HttpResponse, type HttpHandler } from "msw";
import { faker } from "@faker-js/faker";
import { z } from "zod";

const { UPSTASH_VECTOR_REST_URL } = process.env;

const VectorUpsertSchema = z.object({
  vectors: z.array(
    z.object({
      id: z.string(),
      values: z.array(z.number()),
      metadata: z.record(z.unknown()).optional(),
    }),
  ),
  namespace: z.string().optional(),
});

const VectorQuerySchema = z.object({
  vector: z.array(z.number()),
  topK: z.number().min(1).max(100).default(10),
  includeMetadata: z.boolean().default(true),
  includeValues: z.boolean().default(false),
  namespace: z.string().optional(),
  filter: z.record(z.unknown()).optional(),
});

const VectorDeleteSchema = z.object({
  ids: z.array(z.string()).optional(),
  documentId: z.string().optional(),
  prefix: z.string().optional(),
  filter: z.record(z.unknown()).optional(),
});

// Generate mock vector data for consistent testing
export const mockVectors = {
  doc_1: Array.from({ length: 1536 }, (_, i) => Math.sin(i * 0.01)),
  doc_2: Array.from({ length: 1536 }, (_, i) => Math.cos(i * 0.01)),
  doc_3: Array.from(
    { length: 1536 },
    (_, i) => Math.sin(i * 0.02) * Math.cos(i * 0.01),
  ),
  query_1: Array.from(
    { length: 1536 },
    (_, i) => Math.sin(i * 0.005) * Math.cos(i * 0.003),
  ),
};

export const mockMetadata = {
  doc_1: {
    title: "Introduction to React",
    category: "frontend",
    difficulty: "beginner",
    tags: ["react", "javascript", "ui"],
    created_at: "2024-01-15T10:30:00Z",
  },
  doc_2: {
    title: "Advanced Node.js Patterns",
    category: "backend",
    difficulty: "advanced",
    tags: ["nodejs", "javascript", "patterns"],
    created_at: "2024-02-20T14:45:00Z",
  },
  doc_3: {
    title: "Database Design Principles",
    category: "database",
    difficulty: "intermediate",
    tags: ["database", "design", "sql"],
    created_at: "2024-03-10T09:15:00Z",
  },
};

// Calculate similarity score between two vectors (cosine similarity mock)
function calculateSimilarity(vector1: number[], vector2: number[]): number {
  // Simple mock similarity - in real scenarios this would be cosine similarity
  const randomBase = Math.random() * 0.3 + 0.7; // 0.7 to 1.0 range
  const hash = vector1.reduce((acc, val, idx) => acc + val * vector2[idx], 0);
  return Math.min(1.0, Math.abs(hash * 0.0001) + randomBase);
}

export const handlers: HttpHandler[] = [
  // Upsert vectors
  http.post(`${UPSTASH_VECTOR_REST_URL}/upsert`, async ({ request }) => {
    const body = VectorUpsertSchema.parse(await request.json());
    console.info("Mocked vector upsert:", {
      vectorCount: body.vectors.length,
      namespace: body.namespace ?? "",
      sampleIds: body.vectors.slice(0, 3).map((v) => v.id),
    });
    return HttpResponse.json({
      result: "Success",
    });
  }),

  http.post(`${UPSTASH_VECTOR_REST_URL}/query`, async ({ request }) => {
    const body = VectorQuerySchema.parse(await request.json());
    console.info("Mocked vector query:", {
      topK: body.topK,
      namespace: body.namespace ?? "",
      includeMetadata: body.includeMetadata,
      vectorDimensions: body.vector.length,
    });

    const vectorIds = Object.keys(mockVectors);
    const matches = vectorIds
      .slice(0, body.topK)
      .map((id, index) => {
        const score = calculateSimilarity(
          body.vector,
          mockVectors[id as keyof typeof mockVectors],
        );

        return {
          id,
          score: Number(score.toFixed(4)),
          ...(body.includeValues && {
            values: mockVectors[id as keyof typeof mockVectors],
          }),
          ...(body.includeMetadata && {
            metadata: mockMetadata[id as keyof typeof mockMetadata] || {
              title: `Mock Document ${index + 1}`,
              category: faker.helpers.arrayElement(["frontend", "backend"]),
              difficulty: faker.helpers.arrayElement(["beginner"]),
              tags: faker.helpers.arrayElements(
                ["javascript", "typescript", "react"],
                { min: 1, max: 3 },
              ),
              created_at: faker.date.recent({ days: 30 }).toISOString(),
            },
          }),
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by score descending

    return HttpResponse.json({
      result: matches,
    });
  }),

  http.delete(`${UPSTASH_VECTOR_REST_URL}/delete`, async ({ request }) => {
    const body = VectorDeleteSchema.parse(await request.json());
    if (body.documentId) {
      console.info("Mocked vector delete by documentId:", {
        documentId: body.documentId,
      });
    } else {
      console.info("Mocked vector by ids:", {
        ids: body.ids,
      });
    }

    return HttpResponse.json({
      result: { deleted: body.ids?.length ? body.ids.length : 1 },
    });
  }),
];
