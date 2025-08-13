import { VoyageAIClient } from "voyageai";
import { withRetry } from "../misc.server";
import { getErrorMessage } from "../misc";

const voyageClient = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,
});

const MODELS = {
  QUERY: "voyage-3.5",
  CONTEXT: "voyage-context-3",
} as const;

async function generateEmbedding(
  input: string | string[],
  model: (typeof MODELS)[keyof typeof MODELS],
  inputType: "query" | "document",
): Promise<number[][]> {
  const response = await voyageClient.embed({
    input,
    model,
    inputType,
  });
  if (!response.data) {
    throw new Error("No response data from VoyageAI");
  }
  const embeddings = response.data
    .map((item) => item.embedding)
    .filter((embedding): embedding is number[] => !!embedding);

  if (!embeddings.length) {
    throw new Error("No valid embeddings returned");
  }
  return embeddings;
}

export async function generateDocumentEmbedding(
  chunks: string[],
): Promise<number[][]> {
  try {
    const response = await withRetry(
      () => generateEmbedding(chunks, MODELS.CONTEXT, "document"),
      "documentEmbedding",
      { maxRetries: 7 },
    );
    if (!response || !response.length) {
      throw new Error("No embeddings returned from VoyageAI");
    }
    return response;
  } catch (error) {
    console.error("VoyageAI embedding error:", error);
    throw new Error(`Failed to generate embeddings: ${getErrorMessage(error)}`);
  }
}

export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await generateEmbedding(query, MODELS.QUERY, "query");
    if (!response) {
      throw new Error("No embeddings returned from VoyageAI");
    }
    if (!response.length) {
      return [];
    }
    return response[0];
  } catch (error) {
    console.error("VoyageAI query embedding error:", error);
    throw new Error(
      `Failed to generate query embedding: ${getErrorMessage(error)}`,
    );
  }
}
