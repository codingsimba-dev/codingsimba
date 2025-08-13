import { Index, type QueryResult } from "@upstash/vector";
import { getErrorMessage, invariant } from "../misc";
import { withRetry } from "../misc.server";

type Metadata = Record<string, unknown>;

interface ProcessedChunk {
  id: string;
  text: string;
  metadata: Metadata;
}

interface EnhancedMetadata extends Metadata {
  documentId: string;
  chunkIndex: number;
  title?: string;
  url?: string;
  contentType: "code" | "documentation" | "tutorial" | "general";
  difficulty?: "beginner" | "intermediate" | "advanced";
  topics?: string[];
  timestamp: string;
  language?: string;
  sourceType: "upload" | "web" | "manual";
}

interface VectorQueryOptions {
  topK?: number;
  filter?: string;
  includeMetadata?: boolean;
  includeVectors?: boolean;
  minScore?: number;
}

interface QueryResultWithScore<T = EnhancedMetadata> extends QueryResult<T> {
  score: number;
}

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export async function upsertEmbeddings(
  documentId: string,
  chunks: ProcessedChunk[],
  embeddings: number[][],
  additionalMetadata: Partial<EnhancedMetadata> = {},
): Promise<void> {
  invariant(documentId, "documentId is required");
  invariant(
    chunks.length === embeddings.length,
    "Chunks and embeddings length mismatch",
  );

  if (chunks.length === 0) {
    console.warn("No chunks provided for upserting");
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    const vectors = chunks.map((chunk, i) => ({
      id: chunk.id,
      vector: embeddings[i],
      metadata: {
        text: chunk.text,
        documentId,
        chunkIndex: i,
        timestamp,
        contentType: "general",
        sourceType: "upload",
        ...chunk.metadata,
        ...additionalMetadata,
      } as EnhancedMetadata,
    }));

    await withRetry(() => vectorIndex.upsert(vectors), "upsertEmbeddings");
    console.log(`Successfully upserted ${vectors.length} vectors for document`);
  } catch (error) {
    console.error("Upstash upsert error:", error);
    throw new Error(`Failed to upsert vectors: ${getErrorMessage(error)}`);
  }
}

export async function deleteVectorsByDocumentId(
  documentId: string,
): Promise<void> {
  invariant(documentId, "documentId is required");
  try {
    const response = await withRetry(
      () => vectorIndex.delete(documentId),
      "deleteVectorsByDocumentId",
    );
    console.log(
      `Successfully deleted ${response.deleted} vectors for document`,
    );
  } catch (error) {
    console.error("Upstash delete error:", error);
    throw new Error(`Failed to delete vectors: ${getErrorMessage(error)}`);
  }
}

export async function queryVector(
  vector: number[],
  options: VectorQueryOptions = {},
): Promise<QueryResult<Metadata>[]> {
  const {
    topK = 10,
    filter,
    includeMetadata = true,
    includeVectors = false,
  } = options;
  try {
    return vectorIndex.query({
      vector,
      topK,
      filter,
      includeVectors,
      includeMetadata,
    });
  } catch (error) {
    console.error("Upstash query error:", error);
    throw new Error(`Failed to query vectors: ${getErrorMessage(error)}`);
  }
}

/**
 * Hybrid search: combine semantic similarity with keyword matching
 */
export async function hybridSearch(
  queryEmbedding: number[],
  keywords: string[],
  options: VectorQueryOptions = {},
): Promise<QueryResultWithScore<EnhancedMetadata>[]> {
  const { topK = 5 } = options;
  try {
    const semanticResults = await queryVector(queryEmbedding, {
      ...options,
      topK: topK * 2, // Get more for reranking
    });

    // Boost results that contain keywords
    const keywordBoostFactor = 0.1;
    const rerankedResults = semanticResults.map((result) => {
      const text =
        (result.metadata as { text?: string })?.text?.toLowerCase() || "";
      const keywordMatches = keywords.filter((keyword) =>
        text.includes(keyword.toLowerCase()),
      ).length;

      const boostedScore = result.score + keywordMatches * keywordBoostFactor;
      return { ...result, score: boostedScore };
    });

    return rerankedResults
      .sort((a, b) => b.score - a.score)
      .slice(0, topK) as QueryResultWithScore<EnhancedMetadata>[];
  } catch (error) {
    console.error("Hybrid search error:", error);
    throw new Error(
      `Failed to perform hybrid search: ${getErrorMessage(error)}`,
    );
  }
}
