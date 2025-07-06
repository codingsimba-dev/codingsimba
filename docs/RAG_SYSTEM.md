# RAG (Retrieval-Augmented Generation) System Documentation

## Overview

The RAG system provides AI-assisted learning capabilities by enabling students to ask questions about course content and receive intelligent, context-aware responses. The system combines semantic search with AI generation to deliver accurate, educational answers based on relevant document chunks.

## Architecture

### Core Components

1. **Document Processing Pipeline**

   - Text chunking with semantic boundaries
   - Embedding generation using OpenAI's text-embedding-3-small
   - Database storage with metadata

2. **Semantic Search Engine**

   - Vector similarity calculations
   - Top-K retrieval with relevance scoring
   - Context-aware chunk selection

3. **AI Response Generation**
   - Context injection with source attribution
   - Controlled response generation
   - Confidence scoring

## Database Schema

### Documents Table

```sql
model Document {
  id        String          @id @default(ulid())
  title     String          -- Human-readable title
  source    String?         -- Optional source URL
  content   String          -- Full document content
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  chunks    DocumentChunk[] -- Related chunks
}
```

### Document Chunks Table

```sql
model DocumentChunk {
  id         String    @id @default(ulid())
  chunkType  ChunkType @default(TEXT)
  chunkIndex Int       -- Sequential ordering
  embedding  Bytes     -- Vector embedding (1536 dimensions)
  metadata   Json?     -- Additional chunk information
  documentId String    -- Foreign key to document
  content    String    -- Chunk text content
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([documentId])
  @@index([documentId, chunkIndex])
}
```

## API Reference

### Core Functions

#### `generateEmbedding(text: string)`

Generates vector embeddings for semantic search.

**Parameters:**

- `text` (string): Text to embed

**Returns:** `Promise<number[]>` - 1536-dimensional embedding vector

**Example:**

```typescript
const embedding = await generateEmbedding("React hooks tutorial");
console.log(embedding.length); // 1536
```

#### `chunkText(text: string, maxChunkSize = 800, overlap = 100)`

Splits text into overlapping chunks for processing.

**Parameters:**

- `text` (string): Text to chunk
- `maxChunkSize` (number): Maximum characters per chunk
- `overlap` (number): Overlap between chunks

**Returns:** `string[]` - Array of text chunks

**Example:**

```typescript
const chunks = chunkText("Long tutorial content...", 800, 100);
console.log(chunks.length); // Number of chunks created
```

#### `addDocument(title: string, content: string, source?: string)`

Complete pipeline for adding new content to the RAG system.

**Parameters:**

- `title` (string): Document title
- `content` (string): Full document content
- `source` (string, optional): Source URL or reference

**Returns:** `Promise<Document>` - Created document with chunks

**Example:**

```typescript
const document = await addDocument(
  "React Hooks Tutorial",
  "Complete tutorial content...",
  "https://react.dev/learn/hooks",
);
console.log(`Added ${document.chunks.length} chunks`);
```

#### `findRelevantChunks(query: string, topK = 5, documentId?: string)`

Performs semantic search to find relevant document chunks.

**Parameters:**

- `query` (string): Search query
- `topK` (number): Number of top results
- `documentId` (string, optional): Limit search to specific document

**Returns:** `Promise<Array<DocumentChunk & { similarity: number }>>`

**Example:**

```typescript
const relevantChunks = await findRelevantChunks("React useState hook", 3);
relevantChunks.forEach((chunk) => {
  console.log(
    `Similarity: ${chunk.similarity}, Content: ${chunk.content.substring(0, 100)}`,
  );
});
```

#### `askQuestion(question: string, topK = 5, documentId?: string)`

Complete Q&A pipeline with context-aware responses.

**Parameters:**

- `question` (string): User's question
- `topK` (number): Number of chunks to retrieve
- `documentId` (string, optional): Limit search scope

**Returns:** `Promise<{
  answer: string;
  sources: Array<{
    index: number;
    document: string;
    similarity: number;
    content: string;
    metadata: any;
  }>;
  confidence: number;
}>`

**Example:**

```typescript
const result = await askQuestion("How do I use React hooks?");
console.log(`Answer: ${result.answer}`);
console.log(`Confidence: ${result.confidence}%`);
result.sources.forEach((source) => {
  console.log(`Source: ${source.document} (${source.similarity})`);
});
```

## Usage Examples

### Adding Course Content

```typescript
import { addDocument } from "~/utils/openai.server";

// Add a new tutorial to the RAG system
const tutorial = await addDocument(
  "React useState Hook",
  `# React useState Hook

The useState hook is a React Hook that lets you add state to a functional component.

## Basic Usage

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## Key Points

- useState returns an array with the current state and a function to update it
- The initial state is only used on the first render
- State updates trigger re-renders
- Always use the setter function, never modify state directly`,
  "https://react.dev/reference/react/useState",
);
```

### Student Q&A Integration

```typescript
import { askQuestion } from "~/utils/openai.server";

// Handle student question
export async function handleStudentQuestion(question: string, userId: string) {
  try {
    // Check user's AI usage limits
    const monthlyUsage = await prisma.aIUsage.count({
      where: {
        userId,
        usageMonth: new Date().toISOString().slice(0, 7),
      },
    });

    if (monthlyUsage >= 100) {
      throw new Error("Monthly AI usage limit reached");
    }

    // Get AI response
    const result = await askQuestion(question);

    // Track usage
    await prisma.aIUsage.create({
      data: {
        userId,
        type: "learning_assistant",
        prompt: question,
        response: result.answer,
        tokensUsed: estimateTokenCount(question + result.answer),
        costInCents: calculateCost(question + result.answer),
        usageMonth: new Date().toISOString().slice(0, 7),
      },
    });

    return result;
  } catch (error) {
    console.error("Error handling student question:", error);
    throw error;
  }
}
```

### Content Management

```typescript
import { getAllDocuments, deleteDocument } from "~/utils/openai.server";

// List all documents with chunk counts
const documents = await getAllDocuments();
documents.forEach((doc) => {
  console.log(`${doc.title}: ${doc._count.chunks} chunks`);
});

// Delete outdated content
await deleteDocument("old_tutorial_id");
```

## Performance Considerations

### Chunking Strategy

- **Optimal chunk size**: 800 characters with 100 character overlap
- **Sentence boundary awareness**: Breaks at periods and newlines when possible
- **Semantic preservation**: Maintains context across chunk boundaries

### Embedding Generation

- **Model**: OpenAI text-embedding-3-small (1536 dimensions)
- **Cost**: ~$0.00002 per 1K tokens
- **Rate limiting**: 100ms delay between requests

### Similarity Search

- **Algorithm**: Cosine similarity
- **Performance**: O(n) where n = number of chunks
- **Scaling**: Consider vector database (pgvector, Pinecone) for large datasets

## Cost Analysis

### Embedding Generation

- **New document**: ~$0.001 per 50K characters
- **One-time cost**: Generated once per document

### Query Processing

- **Question embedding**: ~$0.00002 per query
- **AI response**: ~$0.017 per response (GPT-4o-mini)
- **Total per Q&A**: ~$0.017

### Monthly Costs (100 queries)

- **Embeddings**: $0.002
- **AI responses**: $1.70
- **Total**: ~$1.70 per user per month

## Best Practices

### Content Quality

1. **Use descriptive titles** for better retrieval
2. **Include code examples** in chunks
3. **Maintain consistent formatting** across documents
4. **Add source URLs** for attribution

### System Prompts

1. **Be specific** about response style and format
2. **Include context rules** for source attribution
3. **Set appropriate temperature** (0.7 for educational content)
4. **Limit response length** for consistency

### Error Handling

1. **Validate input** before processing
2. **Handle API rate limits** gracefully
3. **Log errors** for debugging
4. **Provide fallback responses** when search fails

## Monitoring and Analytics

### Usage Tracking

```typescript
// Track successful queries
await prisma.aIUsage.create({
  data: {
    userId,
    type: "learning_assistant",
    prompt: question,
    response: answer,
    tokensUsed: tokenCount,
    costInCents: cost,
    success: true,
    usageMonth: currentMonth,
  },
});
```

### Performance Metrics

- **Query response time**
- **Similarity score distribution**
- **User satisfaction ratings**
- **Cost per query**

### Quality Assurance

- **Confidence score monitoring**
- **Source attribution accuracy**
- **Response relevance feedback**
- **Content coverage analysis**

## Troubleshooting

### Common Issues

1. **Low similarity scores**

   - Check embedding model compatibility
   - Verify chunk quality and size
   - Review query preprocessing

2. **High API costs**

   - Implement response caching
   - Optimize chunk sizes
   - Use cheaper models for simple queries

3. **Slow response times**
   - Consider vector database indexing
   - Implement query result caching
   - Optimize similarity calculation

### Debug Tools

```typescript
// Enable detailed logging
console.log(`Processing query: "${query}"`);
console.log(`Found ${chunks.length} relevant chunks`);
console.log(`Top similarity: ${chunks[0]?.similarity}`);
```

## Future Enhancements

### Planned Features

1. **Multi-modal support** (images, diagrams)
2. **Conversation memory** for follow-up questions
3. **Personalized learning paths**
4. **Advanced analytics dashboard**

### Scalability Improvements

1. **Vector database migration** (pgvector/Pinecone)
2. **Distributed embedding generation**
3. **Real-time content updates**
4. **Advanced caching strategies**

## Related Files

- `app/utils/openai.server.ts` - Core RAG implementation
- `prisma/schema/rag.prisma` - Database schema
- `prisma/schema/rag.prisma.md` - Schema documentation
- `app/routes/test.tsx` - Testing implementation
- `app/utils/ai.server.ts` - AI usage tracking

## Support

For questions or issues with the RAG system:

- Check the console logs for detailed error messages
- Review the OpenAI API documentation
- Monitor usage and cost metrics
- Contact the development team for complex issues
