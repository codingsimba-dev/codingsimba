/**
 * @fileoverview OpenAI API Integration and RAG (Retrieval-Augmented Generation) System
 *
 * This module provides a complete RAG implementation for AI-assisted learning, including:
 * - Multi-provider AI model management (OpenAI, DeepSeek)
 * - Text embedding generation for semantic search
 * - Document chunking and storage with metadata
 * - Vector similarity search and ranking
 * - Context-aware question answering with source attribution
 * - Usage-based model selection and rate limiting
 *
 * The system enables students to ask questions about course content and receive
 * AI-generated responses based on relevant document chunks from the knowledge base.
 *
 * Key Features:
 * - Automatic model selection based on user plan and usage
 * - Off-peak hour optimization for cost efficiency
 * - Intelligent text chunking with sentence boundary awareness
 * - Cosine similarity for semantic search
 * - Confidence scoring for answer quality
 * - Source attribution and metadata tracking
 *
 * @see {@link https://openai.com/api/} OpenAI API Documentation
 * @see {@link https://platform.openai.com/docs/guides/embeddings} Embeddings Guide
 * @see {@link https://api.deepseek.com/} DeepSeek API Documentation
 */

import { OpenAI } from "openai";
import { prisma } from "./db.server";

// Custom error class for API errors with status codes
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

const { DEEPSEEK_API_KEY } = process.env;
export const OPEN_AI_BASE_URL = "https://api.deepseek.com";

/**
 * OpenAI client instance configured with API key and timeout
 *
 * Dynamically selects between DeepSeek and OpenAI based on current time
 * and availability. Used for chat completions, embeddings, and other
 * AI API interactions.
 *
 * @example
 * ```typescript
 * const response = await openai.chat.completions.create({
 *   model: "deepseek-chat",
 *   messages: [{ role: "user", content: "Hello" }]
 * });
 * ```
 */
export const openai = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: OPEN_AI_BASE_URL,
});

/**
 * Generates vector embeddings for text using OpenAI's text-embedding-3-small model
 *
 * Converts text into high-dimensional vectors (1536 dimensions) that capture
 * semantic meaning. These embeddings are used for similarity search and
 * retrieval in the RAG system.
 *
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} Array of 1536-dimensional embedding values
 *
 * @example
 * ```typescript
 * const embedding = await generateEmbedding("React hooks tutorial");
 * console.log(embedding.length); // 1536
 * console.log(embedding[0]); // First dimension value
 * ```
 *
 * @throws {Error} If OpenAI API request fails or API key is invalid
 */
export async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });
  return response.data[0].embedding;
}

/**
 * Generates AI chat completion with system and user prompts
 *
 * Creates contextual responses using the configured AI model with controlled
 * temperature and token limits for consistent, educational responses.
 * Temperature is set to 0.0 for DeepSeek (deterministic) and 0.7 for OpenAI
 * (more creative).
 *
 * @param {string} systemPrompt - The system instruction/context that defines AI behavior
 * @param {string} userPrompt - The user's question or input to process
 * @returns {Promise<string>} AI-generated response text
 *
 * @example
 * ```typescript
 * const answer = await generateChatCompletion(
 *   "You are a helpful coding tutor. Provide clear, concise explanations.",
 *   "Explain React hooks in simple terms"
 * );
 * console.log(answer); // AI-generated explanation
 * ```
 *
 * @throws {Error} If OpenAI API request fails or model is unavailable
 */
export async function generateChatCompletion(
  systemPrompt: string,
  userPrompt: string,
) {
  const response = await openai.chat.completions.create({
    model: "deepseek-chat",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    // max_completion_tokens: 1000,
    temperature: 0.0,
  });
  return response.choices[0].message.content;
}

/**
 * Splits text into overlapping chunks for processing and embedding
 *
 * Creates manageable chunks that preserve semantic meaning while allowing
 * for overlap to maintain context across chunk boundaries. Optimized for
 * educational content with sentence boundary awareness.
 *
 * Chunking Strategy:
 * - Maximum chunk size: 800 characters (configurable)
 * - Overlap: 100 characters between chunks
 * - Prefers breaking at sentence boundaries (periods) or line breaks
 * - Ensures chunks are not too small (filters empty chunks)
 *
 * @param {string} text - The text to chunk into smaller pieces
 * @param {number} maxChunkSize - Maximum characters per chunk (default: 800)
 * @param {number} overlap - Number of characters to overlap between chunks (default: 100)
 * @returns {string[]} Array of text chunks, each trimmed and non-empty
 *
 * @example
 * ```typescript
 * const chunks = chunkText("Long tutorial content...", 800, 100);
 * console.log(chunks.length); // Number of chunks created
 * chunks.forEach((chunk, i) => {
 *   console.log(`Chunk ${i}: ${chunk.length} chars`);
 * });
 * ```
 */
export function chunkText(text: string, maxChunkSize = 800, overlap = 100) {
  if (!text || text.length === 0) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChunkSize, text.length);
    let chunk = text.slice(start, end);

    // Try to break at sentence boundaries if possible
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const lastBreak = Math.max(lastPeriod, lastNewline);

      if (lastBreak > start + maxChunkSize * 0.5) {
        chunk = text.slice(start, lastBreak + 1);
        start = lastBreak + 1;
      } else {
        start = end - overlap;
      }
    } else {
      start = end;
    }

    chunks.push(chunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Calculates cosine similarity between two vectors
 *
 * Measures the cosine of the angle between two vectors, providing a similarity
 * score between 0 (orthogonal/uncorrelated) and 1 (identical/perfectly correlated).
 * Used for comparing embeddings in semantic search.
 *
 * Mathematical Formula:
 * similarity = (A · B) / (||A|| × ||B||)
 * where A · B is the dot product and ||A|| is the magnitude
 *
 * @param {number[]} vecA - First vector (e.g., query embedding)
 * @param {number[]} vecB - Second vector (e.g., document chunk embedding)
 * @returns {number} Similarity score between 0 and 1, where 1 is most similar
 *
 * @example
 * ```typescript
 * const similarity = cosineSimilarity([1, 0, 0], [0.5, 0.5, 0]);
 * console.log(similarity); // ~0.707 (45-degree angle)
 *
 * const identical = cosineSimilarity([1, 2, 3], [1, 2, 3]);
 * console.log(identical); // 1.0 (perfect similarity)
 * ```
 *
 * @throws {Error} If vectors have different lengths
 */
export function cosineSimilarity(vecA: number[], vecB: number[]) {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Converts embedding array to Buffer for database storage
 *
 * Serializes float array to binary format for efficient storage in database.
 * Uses Float32Array for 32-bit precision and memory efficiency.
 *
 * @param {number[]} embedding - Array of embedding values (typically 1536 dimensions)
 * @returns {Buffer} Binary representation of the embedding for database storage
 *
 * @example
 * ```typescript
 * const embedding = [0.1, 0.2, 0.3, ...];
 * const buffer = embeddingToBuffer(embedding);
 * // Store buffer in database BLOB field
 * ```
 */
export function embeddingToBuffer(embedding: number[]) {
  return Buffer.from(new Float32Array(embedding).buffer);
}

/**
 * Converts Buffer back to embedding array
 *
 * Deserializes binary data from database back to float array for similarity
 * calculations. Reverses the process of embeddingToBuffer().
 *
 * @param {Uint8Array} buffer - Binary data from database BLOB field
 * @returns {number[]} Array of embedding values ready for similarity calculations
 *
 * @example
 * ```typescript
 * const buffer = databaseResult.embedding; // From database
 * const embedding = bufferToEmbedding(buffer);
 * const similarity = cosineSimilarity(queryEmbedding, embedding);
 * ```
 */
export function bufferToEmbedding(buffer: Uint8Array) {
  return Array.from(new Float32Array(buffer.buffer));
}

/**
 * Processes and stores a document with its chunks and embeddings
 *
 * Complete pipeline for adding new content to the RAG system:
 * 1. Splits document into semantic chunks
 * 2. Generates embeddings for each chunk
 * 3. Stores document and chunks in database with metadata
 * 4. Includes rate limiting to avoid API throttling
 *
 * Each chunk includes metadata such as:
 * - Length and word count
 * - Content preview
 * - Chunk index and type
 *
 * @param {string} title - Document title for identification
 * @param {string} content - Full document content to process
 * @param {string | null} source - Optional source URL or reference
 * @returns {Promise<Document>} Created document with all associated chunks
 *
 * @example
 * ```typescript
 * const document = await addDocument(
 *   "React Hooks Tutorial",
 *   "Complete tutorial content about useState, useEffect...",
 *   "https://react.dev/learn/hooks"
 * );
 * console.log(`Added ${document.chunks.length} chunks`);
 * console.log(`Document ID: ${document.id}`);
 * ```
 *
 * @throws {Error} If embedding generation or database operations fail
 */
export async function addDocument(
  title: string,
  content: string,
  source = null,
) {
  console.log(`Processing document: ${title}`);

  // Split content into chunks
  const chunks = chunkText(content, 800, 100);
  console.log(`Created ${chunks.length} chunks`);

  // Generate embeddings for all chunks
  const chunkData = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);

    const embedding = await generateEmbedding(chunks[i]);
    chunkData.push({
      content: chunks[i],
      chunkIndex: i,
      chunkType: "TEXT" as const,
      embedding: embeddingToBuffer(embedding),
      metadata: {
        length: chunks[i].length,
        wordCount: chunks[i].split(" ").length,
        preview: chunks[i].substring(0, 100) + "...",
      },
    });

    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Store document and chunks in database
  const document = await prisma.document.create({
    data: {
      title,
      content,
      source,
      chunks: {
        create: chunkData,
      },
    },
    include: {
      chunks: true,
    },
  });

  console.log(`Document stored with ID: ${document.id}`);
  return document;
}

/**
 * Finds the most relevant document chunks for a given query
 *
 * Performs semantic search by:
 * 1. Generating embedding for the query
 * 2. Comparing against all stored chunk embeddings using cosine similarity
 * 3. Ranking chunks by similarity score
 * 4. Returning top-K most similar chunks
 *
 * Search can be scoped to a specific document or performed across all documents.
 *
 * @param {string} query - The search query to find relevant content for
 * @param {number} topK - Number of top results to return (default: 5)
 * @param {string | null} documentId - Optional document ID to limit search scope
 * @returns {Promise<Array<DocumentChunk & { similarity: number }>>} Top chunks with similarity scores
 *
 * @example
 * ```typescript
 * const relevantChunks = await findRelevantChunks("React useState hook", 3);
 * relevantChunks.forEach(chunk => {
 *   console.log(`Similarity: ${chunk.similarity.toFixed(3)}`);
 *   console.log(`Content: ${chunk.content.substring(0, 100)}...`);
 *   console.log(`Source: ${chunk.document.title}`);
 * });
 * ```
 */
export async function findRelevantChunks(
  query: string,
  topK = 5,
  documentId = null as string | null,
) {
  console.log(`Finding relevant chunks for: "${query}"`);

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Retrieve chunks from database
  const whereClause = documentId ? { documentId } : {};
  const chunks = await prisma.documentChunk.findMany({
    where: whereClause,
    include: {
      document: {
        select: {
          id: true,
          title: true,
          source: true,
        },
      },
    },
  });

  console.log(`Evaluating ${chunks.length} chunks`);

  // Calculate similarity scores
  const similarities = chunks.map((chunk) => {
    const chunkEmbedding = bufferToEmbedding(chunk.embedding);
    const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);

    return {
      ...chunk,
      similarity,
    };
  });

  // Sort by similarity and return top K
  const topChunks = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  console.log(
    `Top similarities: ${topChunks.map((c) => c.similarity.toFixed(3)).join(", ")}`,
  );

  return topChunks;
}

/**
 * Answers questions using RAG (Retrieval-Augmented Generation)
 *
 * Complete Q&A pipeline that:
 * 1. Finds relevant document chunks using semantic search
 * 2. Constructs context from retrieved chunks
 * 3. Generates AI response based on context and question
 * 4. Provides source attribution and confidence scoring
 * 5. Returns structured response with metadata
 *
 * The system ensures answers are grounded in the provided context and
 * includes confidence scores based on similarity of retrieved chunks.
 *
 * @param {string} question - The user's question to answer
 * @param {number} topK - Number of chunks to retrieve for context (default: 5)
 * @param {string | null} documentId - Optional document ID to limit search scope
 * @returns {Promise<{
 *   answer: string;
 *   sources: Array<{
 *     index: number;
 *     document: string;
 *     similarity: number;
 *     content: string;
 *     metadata: any;
 *   }>;
 *   confidence: number;
 * }>} Structured answer with sources and confidence score
 *
 * @example
 * ```typescript
 * const result = await askQuestion("How do I use React hooks?");
 * console.log(`Answer: ${result.answer}`);
 * console.log(`Confidence: ${result.confidence}%`);
 * result.sources.forEach(source => {
 *   console.log(`Source ${source.index}: ${source.document} (${source.similarity})`);
 *   console.log(`Preview: ${source.content}`);
 * });
 * ```
 */
export async function askQuestion({
  question,
  topK = 5,
  previousAnswer = null,
  documentId = null,
}: {
  question: string;
  topK?: number;
  previousAnswer?: string | null;
  documentId?: string | null;
}) {
  console.log(`Processing question: "${question}"`);

  const relevantChunks = await findRelevantChunks(question, topK, documentId);

  if (relevantChunks.length === 0) {
    return {
      answer:
        "I couldn't find any relevant information to answer your question.",
      sources: [],
      confidence: 0,
    };
  }

  const context = relevantChunks
    .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
    .join("\n\n");

  // Generate system prompt
  const systemPrompt = `You are an educational AI that helps students understand course content using retrieved materials.

    Response Protocol:
    1. Return answer in json format
    2. Use ONLY the retrieved context - no external knowledge
    3. If context spans multiple topics, organize your response clearly
    4. Cite sources [1], [2] for each major point
    5. When context is insufficient, suggest specific types of materials the student might need
    6. If retrieved chunks seem unrelated to the question, acknowledge this clearly

    Educational Enhancement:
    - Synthesize information across retrieved chunks when they relate to the same concept
    - Highlight key terms and definitions as they appear in context
    - Note when context provides examples, formulas, or step-by-step procedures
    - Explain relationships between concepts when multiple chunks support this`;

  const userPrompt = `Course Materials Context:
    ${context}
    
    Student Question: ${question}
    
    Based solely on the tutorial/course materials above, please:
    1. Provide a clear, educational explanation
    2. Include relevant examples from the materials
    3. Cite specific sections [1], [2], etc.
    4. If information is incomplete, specify what's missing
    5. If the question is not related to the tutorial/course materials, say so clearly`;

  // Generate response
  const answer = await generateChatCompletion(systemPrompt, userPrompt);

  // Calculate confidence based on similarity scores
  const avgSimilarity =
    relevantChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) /
    relevantChunks.length;
  const confidence = Math.min(avgSimilarity * 100, 100);

  return {
    answer: previousAnswer ? previousAnswer + "\n\n" + answer : answer,
    sources: relevantChunks.map((chunk, index) => ({
      index: index + 1,
      document: chunk.document.title,
      similarity: parseFloat(chunk.similarity.toFixed(3)),
      content: chunk.content.substring(0, 200) + "...",
      metadata: chunk.metadata,
    })),
    confidence: parseFloat(confidence.toFixed(1)),
  };
}

/**
 * Retrieves all documents with their chunk counts
 *
 * Returns a list of all documents in the system along with metadata
 * about how many chunks each document contains. Useful for system
 * administration and content management.
 *
 * @returns {Promise<Array<Document & { _count: { chunks: number } }>>} All documents with chunk counts
 *
 * @example
 * ```typescript
 * const documents = await getAllDocuments();
 * documents.forEach(doc => {
 *   console.log(`${doc.title}: ${doc._count.chunks} chunks`);
 *   console.log(`Created: ${doc.createdAt}`);
 *   console.log(`Source: ${doc.source || 'N/A'}`);
 * });
 * ```
 */
export async function getAllDocuments() {
  return await prisma.document.findMany({
    include: {
      _count: {
        select: { chunks: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Deletes a document and all its associated chunks
 *
 * Removes a document from the system along with all its chunks and
 * embeddings. This operation is irreversible and will cascade delete
 * all related data.
 *
 * @param {string} documentId - ID of the document to delete
 * @returns {Promise<Document>} The deleted document object
 *
 * @example
 * ```typescript
 * try {
 *   const deletedDoc = await deleteDocument("doc_123");
 *   console.log(`Deleted: ${deletedDoc.title}`);
 * } catch (error) {
 *   console.error("Failed to delete document:", error);
 * }
 * ```
 *
 * @throws {Error} If document doesn't exist or database operation fails
 */
export async function deleteDocument(documentId: string) {
  return await prisma.document.delete({
    where: { id: documentId },
  });
}
