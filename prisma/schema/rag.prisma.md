# RAG Schema Documentation

## Overview

The `rag.prisma` file defines the database schema for a Retrieval-Augmented Generation (RAG) system. This schema enables efficient storage and retrieval of document chunks with vector embeddings for semantic search and AI-powered content generation.

## Models

### Document

The `Document` model represents the source documents that are processed and chunked for the RAG system.

#### Fields

| Field       | Type       | Description                                                   |
| ----------- | ---------- | ------------------------------------------------------------- |
| `id`        | `String`   | Unique identifier using ULID format                           |
| `title`     | `String`   | Human-readable title of the document                          |
| `source`    | `String?`  | Optional source URL or reference for the document             |
| `content`   | `String`   | The full text content of the document                         |
| `createdAt` | `DateTime` | Timestamp when the document was created (auto-generated)      |
| `updatedAt` | `DateTime` | Timestamp when the document was last updated (auto-generated) |

#### Relationships

- **One-to-Many**: A document can have multiple `DocumentChunk` records
- **Related Field**: `chunks` - Array of associated document chunks

### DocumentChunk

The `DocumentChunk` model represents individual segments of documents that have been processed for vector search and retrieval.

#### Fields

| Field        | Type        | Description                                                |
| ------------ | ----------- | ---------------------------------------------------------- |
| `id`         | `String`    | Unique identifier using ULID format                        |
| `chunkType`  | `ChunkType` | Type of chunk (TEXT or IMAGE)                              |
| `chunkIndex` | `Int`       | Sequential index of the chunk within its parent document   |
| `embedding`  | `Bytes`     | Vector embedding data for semantic search                  |
| `metadata`   | `Json?`     | Optional metadata associated with the chunk                |
| `documentId` | `String`    | Foreign key reference to the parent document               |
| `content`    | `String`    | The text content of this specific chunk                    |
| `createdAt`  | `DateTime`  | Timestamp when the chunk was created (auto-generated)      |
| `updatedAt`  | `DateTime`  | Timestamp when the chunk was last updated (auto-generated) |

#### Relationships

- **Many-to-One**: Each chunk belongs to a single `Document`
- **Related Field**: `document` - Reference to the parent document

#### Indexes

- `[documentId]` - Optimizes queries filtering by document
- `[documentId, chunkIndex]` - Optimizes ordered retrieval of chunks within a document

## Enums

### ChunkType

Defines the supported types of document chunks:

- **TEXT** - Text-based content chunks
- **IMAGE** - Image-based content chunks (for multimodal RAG)

## Usage Examples

### Creating a Document with Chunks

```typescript
// Create a new document
const document = await prisma.document.create({
  data: {
    title: "Getting Started with React",
    source: "https://react.dev/learn",
    content: "React is a JavaScript library for building user interfaces...",
  },
});

// Create chunks for the document
const chunks = await prisma.documentChunk.createMany({
  data: [
    {
      documentId: document.id,
      chunkType: "TEXT",
      chunkIndex: 0,
      embedding: Buffer.from([
        /* vector embedding bytes */
      ]),
      content: "React is a JavaScript library...",
      metadata: { section: "introduction" },
    },
    {
      documentId: document.id,
      chunkType: "TEXT",
      chunkIndex: 1,
      embedding: Buffer.from([
        /* vector embedding bytes */
      ]),
      content: "To get started with React...",
      metadata: { section: "setup" },
    },
  ],
});
```

### Retrieving Document Chunks

```typescript
// Get all chunks for a document in order
const chunks = await prisma.documentChunk.findMany({
  where: { documentId: "document-id" },
  orderBy: { chunkIndex: "asc" },
  include: { document: true },
});

// Get chunks with specific metadata
const textChunks = await prisma.documentChunk.findMany({
  where: {
    chunkType: "TEXT",
    metadata: { path: ["section"], equals: "introduction" },
  },
});
```

### Vector Search (Conceptual)

```typescript
// This would typically be implemented with a vector database extension
// or custom query logic for similarity search
const similarChunks = await prisma.$queryRaw`
  SELECT id, content, embedding
  FROM DocumentChunk 
  WHERE chunkType = 'TEXT'
  ORDER BY embedding <-> ${queryEmbedding}::vector
  LIMIT 10
`;
```

## Design Considerations

### Vector Storage

- **Embedding Format**: The `embedding` field stores vector data as `Bytes`, allowing for flexible vector formats
- **Indexing**: Consider adding vector similarity indexes for production use
- **Size Limits**: Be mindful of database size as embeddings can be large

### Chunking Strategy

- **Sequential Indexing**: `chunkIndex` ensures proper ordering of chunks
- **Metadata Flexibility**: The `Json` metadata field allows for custom chunk annotations
- **Multimodal Support**: `ChunkType` enum supports both text and image content

### Performance

- **Indexes**: Database indexes optimize common query patterns
- **Relationships**: Proper foreign key relationships ensure data integrity
- **Timestamps**: Auto-generated timestamps help with auditing and caching

## Integration with RAG Pipeline

1. **Document Ingestion**: Documents are stored in the `Document` table
2. **Chunking**: Documents are split into manageable chunks
3. **Embedding**: Each chunk is processed to generate vector embeddings
4. **Storage**: Chunks and embeddings are stored in `DocumentChunk`
5. **Retrieval**: Vector similarity search retrieves relevant chunks
6. **Generation**: Retrieved chunks are used to augment AI responses

## Migration Notes

When modifying this schema:

1. **Backup Data**: Always backup existing data before schema changes
2. **Embedding Compatibility**: Ensure embedding format changes are handled gracefully
3. **Index Updates**: Update or add indexes as query patterns evolve
4. **Data Migration**: Plan for migrating existing embeddings if format changes

## Related Files

- `prisma/schema/schema.prisma` - Main schema file that includes this module
- `app/utils/ai.server.ts` - Likely contains RAG implementation logic
- `app/routes/` - API endpoints for document management and search
