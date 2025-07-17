# Conversation Management System

## Overview

The Conversation Management System provides persistent chat history for the RAG (Retrieval-Augmented Generation) chatbot. It enables users to have contextual conversations about specific documents while maintaining conversation history and implementing intelligent message merging.

## Key Features

- **Document-Specific Conversations**: Each conversation is tied to a specific document ID
- **User Association**: Conversations are linked to authenticated users
- **Message Persistence**: All messages are stored in the database
- **Intelligent Merging**: Previous responses are merged with new ones for context continuity
- **Automatic Cleanup**: Old merged messages are automatically cleaned up
- **Conversation History**: Full conversation history retrieval and management

## Architecture

### Database Schema

#### Conversation Model

```sql
model Conversation {
  id            String    @id @default(ulid())
  userId        String    -- User who owns the conversation
  documentId    String?   -- Optional document this conversation is about
  title         String    -- Human-readable conversation title
  isActive      Boolean   @default(true)
  messageCount  Int       @default(0)
  lastMessageAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  messages      ConversationMessage[]
}
```

#### ConversationMessage Model

```sql
model ConversationMessage {
  id            String    @id @default(ulid())
  conversationId String
  role          MessageRole -- 'user' or 'assistant'
  content       String
  question      String?   -- For assistant messages
  sources       Json?     -- Sources used for response
  confidence    Float?    -- Confidence score (0-100)
  tokensUsed    Int       @default(0)
  isMerged      Boolean   @default(false)
  mergedAt      DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## API Reference

### Core Functions

#### `createConversation(params)`

Creates a new conversation for a user and document.

**Parameters:**

```typescript
{
  userId: string;
  documentId?: string;
  title: string;
}
```

**Returns:** `Promise<Conversation>`

#### `getOrCreateConversation(params)`

Gets an existing active conversation or creates a new one.

**Parameters:**

```typescript
{
  userId: string;
  documentId?: string;
  title: string;
}
```

**Returns:** `Promise<Conversation>`

#### `addUserMessage(params)`

Adds a user message to a conversation.

**Parameters:**

```typescript
{
  conversationId: string;
  content: string;
}
```

**Returns:** `Promise<ConversationMessage>`

#### `addAssistantMessage(params)`

Adds an assistant message to a conversation.

**Parameters:**

```typescript
{
  conversationId: string;
  content: string;
  question?: string;
  sources?: any;
  confidence?: number;
  tokensUsed?: number;
}
```

**Returns:** `Promise<ConversationMessage>`

#### `getPreviousAnswer(conversationId)`

Retrieves the most recent unmerged assistant message.

**Parameters:**

```typescript
conversationId: string;
```

**Returns:** `Promise<string | null>`

#### `mergeResponses(params)`

Merges a new response with the previous response and marks the previous as merged.

**Parameters:**

```typescript
{
  conversationId: string;
  newResponse: string;
  question?: string;
  sources?: any;
  confidence?: number;
  tokensUsed?: number;
}
```

**Returns:** `Promise<ConversationMessage>`

## Usage Examples

### Basic Conversation Flow

```typescript
import {
  getOrCreateConversation,
  addUserMessage,
  mergeResponses,
} from "~/utils/conversation.server";

// In your chatbot action
export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const { documentId, question } = await parseFormData(request);

  // Get or create conversation
  const conversation = await getOrCreateConversation({
    userId,
    documentId,
    title: `Chat about ${documentId || "general topics"}`,
  });

  // Add user message
  await addUserMessage({
    conversationId: conversation.id,
    content: question,
  });

  // Get AI response
  const aiResponse = await askQuestion({ question, documentId });

  // Merge response with conversation history
  await mergeResponses({
    conversationId: conversation.id,
    newResponse: aiResponse.answer,
    question,
    sources: aiResponse.sources,
    confidence: aiResponse.confidence,
  });

  return { answer: aiResponse.answer };
}
```

### Retrieving Conversation History

```typescript
import { getConversationHistory } from "~/utils/conversation.server";

// Get all conversations for a user and document
const conversations = await getConversationHistory({
  userId: "user-123",
  documentId: "doc-456",
  limit: 50,
});

// Get messages for a specific conversation
const messages = await getConversationMessages({
  conversationId: "conv-789",
  limit: 100,
});
```

### Conversation Management

```typescript
import {
  archiveConversation,
  getConversationStats,
} from "~/utils/conversation.server";

// Archive a conversation
await archiveConversation("conv-123");

// Get user statistics
const stats = await getConversationStats("user-123");
console.log(stats);
// {
//   totalConversations: 15,
//   activeConversations: 3,
//   totalMessages: 127,
//   averageMessagesPerConversation: 8
// }
```

## Message Merging Strategy

The system implements intelligent message merging to maintain conversation context:

1. **Previous Response Retrieval**: Gets the most recent unmerged assistant message
2. **Content Merging**: Combines previous response with new response using `\n\n` separator
3. **Mark as Merged**: Sets `isMerged: true` and `mergedAt` timestamp on previous message
4. **Create New Message**: Creates a new message with the merged content
5. **Cleanup**: Old merged messages are automatically cleaned up after a configurable period

### Example Merging Flow

```
User: "What is React?"
Assistant: "React is a JavaScript library for building user interfaces."

User: "How do I create a component?"
Assistant: "React is a JavaScript library for building user interfaces.

To create a component, you can use function components or class components."
```

## Cleanup and Maintenance

### Automatic Cleanup

The system includes automatic cleanup of old merged messages:

```typescript
import { cleanupMergedMessages } from "~/utils/conversation.server";

// Clean up messages merged more than 7 days ago
const deletedCount = await cleanupMergedMessages(7);
console.log(`Cleaned up ${deletedCount} merged messages`);
```

### Recommended Cleanup Schedule

Set up a daily cron job to clean up old merged messages:

```typescript
// In your cron job
import { cleanupMergedMessages } from "~/utils/conversation.server";

export async function dailyCleanup() {
  try {
    const deletedCount = await cleanupMergedMessages(7); // 7 days
    console.log(`Daily cleanup: removed ${deletedCount} merged messages`);
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}
```

## Performance Considerations

### Indexing Strategy

The database includes optimized indexes for common queries:

- `@@index([userId])` - User conversation lookups
- `@@index([documentId])` - Document-specific conversations
- `@@index([isActive])` - Active conversation filtering
- `@@index([lastMessageAt])` - Recent conversation sorting
- `@@index([conversationId])` - Message retrieval
- `@@index([isMerged])` - Unmerged message filtering

### Query Optimization

- Use `isMerged: false` filter to only retrieve active messages
- Limit message retrieval with `take` parameter
- Use `orderBy` for consistent sorting
- Implement pagination for large conversation histories

## Security Considerations

### User Isolation

- All conversations are scoped to specific users
- Users can only access their own conversations
- Database queries include user ID filters

### Data Privacy

- Conversation data is tied to user accounts
- Implement data retention policies
- Consider GDPR compliance for conversation data
- Provide user controls for conversation deletion

## Testing

### Test Script

Run the conversation system test:

```bash
npm run test:conversation
```

This script tests:

- Conversation creation
- Message addition
- Response merging
- History retrieval
- Statistics calculation

### Manual Testing

1. Start a conversation with a document
2. Ask multiple questions
3. Verify conversation history persistence
4. Check message merging functionality
5. Test conversation cleanup

## Migration Guide

### Adding to Existing Projects

1. **Run Migration**: Execute the Prisma migration to add conversation tables
2. **Update Chatbot Route**: Integrate conversation management into your chatbot action
3. **Add User Authentication**: Ensure users are authenticated before creating conversations
4. **Test Integration**: Verify conversation persistence and merging work correctly

### Database Migration

```bash
npx prisma migrate dev --name add_conversation_models
npx prisma generate
```

## Troubleshooting

### Common Issues

1. **Missing User ID**: Ensure `requireUserId` is called before conversation operations
2. **Migration Errors**: Check that all schema changes are properly migrated
3. **Performance Issues**: Verify indexes are created and queries are optimized
4. **Memory Leaks**: Ensure cleanup jobs are running regularly

### Debug Queries

```sql
-- Check conversation counts
SELECT userId, COUNT(*) as conversation_count
FROM Conversation
GROUP BY userId;

-- Check merged message counts
SELECT COUNT(*) as merged_count
FROM ConversationMessage
WHERE isMerged = true;

-- Find conversations without recent activity
SELECT * FROM Conversation
WHERE lastMessageAt < datetime('now', '-30 days');
```

## Future Enhancements

### Planned Features

- **Conversation Export**: Allow users to export conversation history
- **Conversation Sharing**: Share conversations between users
- **Advanced Analytics**: Detailed conversation analytics and insights
- **Message Search**: Full-text search across conversation messages
- **Conversation Templates**: Pre-defined conversation starters
- **Multi-language Support**: Internationalization for conversation titles and content

### Performance Improvements

- **Message Compression**: Compress long conversation histories
- **Caching Layer**: Redis caching for frequently accessed conversations
- **Read Replicas**: Database read replicas for conversation queries
- **Message Archiving**: Automatic archiving of old conversations
