/**
 * @fileoverview OpenAI API Integration and RAG (Retrieval-Augmented Generation) System
 *
 * This module provides a complete RAG implementation for AI-assisted learning, including:
 * - OpenAI API client configuration
 * - Text embedding generation for semantic search
 * - Document chunking and storage
 * - Vector similarity search
 * - Context-aware question answering
 *
 * The system enables students to ask questions about course content and receive
 * AI-generated responses based on relevant document chunks.
 *
 * @see {@link https://openai.com/api/} OpenAI API Documentation
 * @see {@link https://platform.openai.com/docs/guides/embeddings} Embeddings Guide
 */

import { OpenAI } from "openai";
import { prisma } from "./db.server";

/**
 * OpenAI client instance configured with API key and timeout
 *
 * Used for chat completions, embeddings, and other OpenAI API interactions.
 * Requires OPENAI_API_KEY environment variable to be set.
 *
 * @example
 * ```typescript
 * const response = await openai.chat.completions.create({
 *   model: "gpt-4o-mini",
 *   messages: [{ role: "user", content: "Hello" }]
 * });
 * ```
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10_000,
});

/**
 * Generates vector embeddings for text using OpenAI's text-embedding-3-small model
 *
 * Converts text into high-dimensional vectors that capture semantic meaning.
 * These embeddings are used for similarity search and retrieval.
 *
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} Array of 1536-dimensional embedding values
 *
 * @example
 * ```typescript
 * const embedding = await generateEmbedding("React hooks tutorial");
 * console.log(embedding.length); // 1536
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
 * Creates contextual responses using GPT-4o-mini model with controlled
 * temperature and token limits for consistent, educational responses.
 *
 * @param {string} systemPrompt - The system instruction/context
 * @param {string} userPrompt - The user's question or input
 * @returns {Promise<string>} AI-generated response text
 *
 * @example
 * ```typescript
 * const answer = await generateChatCompletion(
 *   "You are a helpful coding tutor.",
 *   "Explain React hooks in simple terms"
 * );
 * ```
 *
 * @throws {Error} If OpenAI API request fails
 */
export async function generateChatCompletion(
  systemPrompt: string,
  userPrompt: string,
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_completion_tokens: 1000,
    temperature: 0.7,
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
 * @param {string} text - The text to chunk
 * @param {number} maxChunkSize - Maximum characters per chunk (default: 800)
 * @param {number} overlap - Number of characters to overlap between chunks (default: 100)
 * @returns {string[]} Array of text chunks
 *
 * @example
 * ```typescript
 * const chunks = chunkText("Long tutorial content...", 800, 100);
 * console.log(chunks.length); // Number of chunks created
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
 * score between 0 (orthogonal) and 1 (identical). Used for comparing embeddings.
 *
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Similarity score between 0 and 1
 *
 * @example
 * ```typescript
 * const similarity = cosineSimilarity([1, 0, 0], [0.5, 0.5, 0]);
 * console.log(similarity); // ~0.707
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
 *
 * @param {number[]} embedding - Array of embedding values
 * @returns {Buffer} Binary representation of the embedding
 *
 * @example
 * ```typescript
 * const buffer = embeddingToBuffer([0.1, 0.2, 0.3, ...]);
 * // Store buffer in database
 * ```
 */
export function embeddingToBuffer(embedding: number[]) {
  return Buffer.from(new Float32Array(embedding).buffer);
}

/**
 * Converts Buffer back to embedding array
 *
 * Deserializes binary data from database back to float array for similarity calculations.
 *
 * @param {Uint8Array} buffer - Binary data from database
 * @returns {number[]} Array of embedding values
 *
 * @example
 * ```typescript
 * const embedding = bufferToEmbedding(databaseBuffer);
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
 * 1. Splits document into chunks
 * 2. Generates embeddings for each chunk
 * 3. Stores document and chunks in database
 * 4. Includes metadata for each chunk
 *
 * @param {string} title - Document title
 * @param {string} content - Full document content
 * @param {string | null} source - Optional source URL or reference
 * @returns {Promise<Document>} Created document with chunks
 *
 * @example
 * ```typescript
 * const document = await addDocument(
 *   "React Hooks Tutorial",
 *   "Complete tutorial content...",
 *   "https://react.dev/learn/hooks"
 * );
 * console.log(`Added ${document.chunks.length} chunks`);
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
 * 2. Comparing against all stored chunk embeddings
 * 3. Returning top-K most similar chunks
 *
 * @param {string} query - The search query
 * @param {number} topK - Number of top results to return (default: 5)
 * @param {string | null} documentId - Optional document ID to limit search scope
 * @returns {Promise<Array<DocumentChunk & { similarity: number }>>} Top chunks with similarity scores
 *
 * @example
 * ```typescript
 * const relevantChunks = await findRelevantChunks("React useState hook", 3);
 * relevantChunks.forEach(chunk => {
 *   console.log(`Similarity: ${chunk.similarity}, Content: ${chunk.content.substring(0, 100)}`);
 * });
 * ```
 */
export async function findRelevantChunks(
  query: string,
  topK = 5,
  documentId = null,
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
 * 1. Finds relevant document chunks
 * 2. Constructs context from chunks
 * 3. Generates AI response based on context
 * 4. Provides source attribution and confidence score
 *
 * @param {string} question - The user's question
 * @param {number} topK - Number of chunks to retrieve (default: 5)
 * @param {string | null} documentId - Optional document ID to limit search
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
 * }>} Answer with sources and confidence
 *
 * @example
 * ```typescript
 * const result = await askQuestion("How do I use React hooks?");
 * console.log(`Answer: ${result.answer}`);
 * console.log(`Confidence: ${result.confidence}%`);
 * result.sources.forEach(source => {
 *   console.log(`Source: ${source.document} (${source.similarity})`);
 * });
 * ```
 */
export async function askQuestion(
  question: string,
  topK = 5,
  documentId = null,
) {
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
  const systemPrompt = `You are a helpful assistant that answers questions based on provided context.
  Rules:
   1. Only answer based on the context provided
   2. If you can't find the answer in the context, say so clearly
   3. Reference the context sections [1], [2], etc. when relevant
   4. Be concise but thorough
   5. If the context is insufficient, ask for clarification`;
  const userPrompt = `Context:
    ${context}

    Question: ${question}

    Please provide a helpful answer based on the context above.`;

  // Generate response
  const answer = await generateChatCompletion(systemPrompt, userPrompt);

  // Calculate confidence based on similarity scores
  const avgSimilarity =
    relevantChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) /
    relevantChunks.length;
  const confidence = Math.min(avgSimilarity * 100, 100);

  return {
    answer,
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
 * Retrieves all documents with chunk counts
 *
 * @returns {Promise<Array<Document & { _count: { chunks: number } }>>} All documents with chunk counts
 *
 * @example
 * ```typescript
 * const documents = await getAllDocuments();
 * documents.forEach(doc => {
 *   console.log(`${doc.title}: ${doc._count.chunks} chunks`);
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
 * @param {string} documentId - ID of the document to delete
 * @returns {Promise<Document>} The deleted document
 *
 * @example
 * ```typescript
 * await deleteDocument("doc_123");
 * console.log("Document deleted successfully");
 * ```
 */
export async function deleteDocument(documentId: string) {
  return await prisma.document.delete({
    where: { id: documentId },
  });
}
