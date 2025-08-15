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

const { UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN } = process.env;

const vectorIndex = new Index({
  url: UPSTASH_VECTOR_REST_URL,
  token: UPSTASH_VECTOR_REST_TOKEN,
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
