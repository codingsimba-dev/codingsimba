# Authentication System Documentation

## Overview

The authentication system provides secure user authentication and authorization using GitHub OAuth, session management, and role-based access control. It supports both social login and traditional email/password authentication.

## Architecture

### Core Components

1. **OAuth Providers** - GitHub integration for social login
2. **Session Management** - Secure session storage and validation
3. **User Management** - User profiles, roles, and permissions
4. **Security Features** - CSRF protection, password hashing, rate limiting

## Database Schema

### Users Table

```sql
model User {
  id                    String    @id @default(ulid())
  email                 String    @unique
  name                  String?
  username              String?   @unique
  imageUrl              String?
  isSubscribed          Boolean   @default(false)
  plan                  Plan      @default(basic)
  subscriptionType      SubscriptionType @default(individual)
  lastSeenAt            DateTime  @default(now())
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations
  password              Password?
  sessions              Session[]
  image                 Image?
  teams                 TeamMember[]
  subscriptions         Subscription[]
  aiUsage               AIUsage[]
}
```

### Sessions Table

```sql
model Session {
  id             String   @id @default(ulid())
  expirationDate DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  userId         String

  @@index([userId])
}
```

### Passwords Table

```sql
model Password {
  hash   String
  userId String @unique
}
```

## Authentication Flow

### GitHub OAuth Flow

1. **User initiates login**

   ```typescript
   // Redirect to GitHub OAuth
   window.location.href = "/auth/github";
   ```

2. **GitHub authorization**

   - User authorizes application
   - GitHub redirects with authorization code

3. **Token exchange**

   ```typescript
   // Exchange code for access token
   const tokens = await githubStrategy.validate({ code });
   ```

4. **User creation/retrieval**

   ```typescript
   // Get user data from GitHub
   const userData = await fetchGitHubUser(tokens.accessToken);

   // Create or update user
   const user = await upsertUser(userData);
   ```

5. **Session creation**
   ```typescript
   // Create secure session
   const session = await createUserSession(user.id, request);
   ```

### Email/Password Flow

1. **User registration**

   ```typescript
   const hashedPassword = await bcrypt.hash(password, 10);
   const user = await prisma.user.create({
     data: { email, name, password: { create: { hash: hashedPassword } } },
   });
   ```

2. **User login**
   ```typescript
   const user = await verifyLogin(email, password);
   const session = await createUserSession(user.id, request);
   ```

## API Reference

### Authentication Functions

#### `requireUserId(request: Request)`

Ensures user is authenticated and returns user ID.

**Parameters:**

- `request` (Request): HTTP request object

**Returns:** `Promise<string>` - User ID

**Throws:** Redirects to login if not authenticated

**Example:**

```typescript
const userId = await requireUserId(request);
const user = await prisma.user.findUnique({ where: { id: userId } });
```

#### `getUserId(request: Request)`

Gets user ID from session without requiring authentication.

**Parameters:**

- `request` (Request): HTTP request object

**Returns:** `Promise<string | null>` - User ID or null

**Example:**

```typescript
const userId = await getUserId(request);
if (userId) {
  // User is logged in
}
```

#### `createUserSession(userId: string, request: Request)`

Creates a new user session.

**Parameters:**

- `userId` (string): User ID
- `request` (Request): HTTP request object

**Returns:** `Promise<string>` - Session ID

**Example:**

```typescript
const sessionId = await createUserSession(user.id, request);
```

#### `getSession(request: Request)`

Retrieves current session data.

**Parameters:**

- `request` (Request): HTTP request object

**Returns:** `Promise<Session | null>` - Session data or null

**Example:**

```typescript
const session = await getSession(request);
if (session) {
  // Session exists
}
```

### OAuth Functions

#### `GitHubProvider.getAuthStrategy()`

Creates GitHub OAuth strategy for authentication.

**Returns:** `GitHubStrategy` - Configured OAuth strategy

**Example:**

```typescript
const githubStrategy = new GitHubProvider().getAuthStrategy();
```

#### `createCheckoutSession(params)`

Creates payment checkout session for subscriptions.

**Parameters:**

- `userId` (string): User ID
- `products` (string[]): Product IDs
- `successUrl` (string): Success redirect URL
- `customerEmail` (string): Customer email
- `customerName` (string): Customer name

**Returns:** `Promise<CheckoutSession>` - Checkout session data

**Example:**

```typescript
const session = await createCheckoutSession({
  userId: "user_123",
  products: ["premium_subscription"],
  successUrl: "https://example.com/success",
  customerEmail: "user@example.com",
  customerName: "John Doe",
});
```

## Security Features

### CSRF Protection

```typescript
// CSRF token validation
export async function validateCSRF(request: Request) {
  const formData = await request.formData();
  const csrfToken = formData.get("csrfToken");

  if (!csrfToken || !isValidCSRFToken(csrfToken)) {
    throw new Error("Invalid CSRF token");
  }
}
```

### Password Security

```typescript
// Password hashing with bcrypt
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

// Password verification
export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
```

### Session Security

```typescript
// Secure session configuration
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});
```

## User Roles and Permissions

### Plan Types

```typescript
enum Plan {
  basic = "basic",
  premium = "premium",
  pro = "pro",
}

enum SubscriptionType {
  individual = "individual",
  team = "team",
}
```

### Permission Checking

```typescript
// Check if user has premium access
export function hasPremiumAccess(user: User) {
  return user.isSubscribed && user.plan !== "basic";
}

// Check AI usage limits
export async function checkAIUsageLimit(userId: string) {
  const monthlyUsage = await prisma.aIUsage.count({
    where: {
      userId,
      usageMonth: new Date().toISOString().slice(0, 7),
    },
  });

  return monthlyUsage < 100; // Premium limit
}
```

## Usage Examples

### Protected Route Implementation

```typescript
export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isSubscribed: true,
      plan: true,
    },
  });

  return { user };
}
```

### Conditional Rendering

```typescript
export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>

      {user.isSubscribed ? (
        <PremiumFeatures />
      ) : (
        <UpgradePrompt />
      )}

      {user.plan === "pro" && <ProFeatures />}
    </div>
  );
}
```

### Session Management

```typescript
// Logout implementation
export async function action({ request }: ActionArgs) {
  const session = await getSession(request);

  if (session) {
    await prisma.session.delete({
      where: { id: session.id },
    });
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
```

## Environment Variables

### Required Variables

```env
# Session security
SESSION_SECRET=your-super-secret-key-here

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# Admin access
ADMIN_PASSWORD=admin-password-for-setup
```

### Optional Variables

```env
# Discord integration
DISCORD_WEBHOOK_URL=your-discord-webhook-url
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_GUILD_ID=your-discord-server-id
```

## Error Handling

### Common Authentication Errors

```typescript
// Handle OAuth errors
try {
  const user = await authenticator.authenticate("github", request);
} catch (error) {
  if (error instanceof AuthorizationError) {
    // User denied authorization
    return redirect("/login?error=denied");
  }
  throw error;
}

// Handle session expiration
export async function requireValidSession(request: Request) {
  const session = await getSession(request);

  if (!session || session.expirationDate < new Date()) {
    throw redirect("/login?error=expired");
  }

  return session;
}
```

## Testing

### Authentication Tests

```typescript
// Test user creation
test("creates user with GitHub OAuth", async () => {
  const userData = {
    id: "123",
    email: "test@example.com",
    name: "Test User",
    login: "testuser",
    avatar_url: "https://example.com/avatar.jpg",
  };

  const user = await createOrUpdateUser(userData);
  expect(user.email).toBe("test@example.com");
});

// Test session management
test("creates and validates session", async () => {
  const userId = "user_123";
  const sessionId = await createUserSession(userId, request);

  const session = await getSession(request);
  expect(session?.userId).toBe(userId);
});
```

## Security Best Practices

### 1. Session Management

- Use secure, HTTP-only cookies
- Implement session expiration
- Rotate session secrets regularly
- Validate session data on each request

### 2. Password Security

- Use bcrypt with salt rounds ≥ 10
- Never store plain text passwords
- Implement password strength requirements
- Use secure password reset flows

### 3. OAuth Security

- Validate OAuth state parameters
- Verify OAuth provider responses
- Implement proper error handling
- Use HTTPS in production

### 4. Rate Limiting

```typescript
// Implement rate limiting for login attempts
export async function rateLimitLogin(email: string) {
  const attempts = await getLoginAttempts(email);

  if (attempts > 5) {
    throw new Error("Too many login attempts. Try again later.");
  }
}
```

## Monitoring and Analytics

### Authentication Metrics

```typescript
// Track login events
export async function trackLogin(userId: string, method: "github" | "email") {
  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: new Date() },
  });

  // Log analytics event
  await analytics.track("user_login", {
    userId,
    method,
    timestamp: new Date(),
  });
}
```

### Security Monitoring

- Failed login attempts
- Session creation/deletion
- OAuth authorization failures
- Suspicious activity patterns

## Troubleshooting

### Common Issues

1. **Session not persisting**

   - Check cookie settings
   - Verify session secret
   - Ensure HTTPS in production

2. **OAuth callback errors**

   - Verify redirect URI configuration
   - Check GitHub app settings
   - Validate OAuth state

3. **Password reset issues**
   - Check email configuration
   - Verify token expiration
   - Validate reset URL format

### Debug Tools

```typescript
// Enable authentication debugging
console.log("Session data:", await getSession(request));
console.log("User data:", await getUser(request));
console.log("OAuth state:", oauthState);
```

## Related Files

- `app/utils/auth.server.ts` - Core authentication utilities
- `app/utils/session.server.ts` - Session management
- `app/utils/providers/github.server.ts` - GitHub OAuth provider
- `app/routes/auth/` - Authentication routes
- `app/hooks/user.ts` - User data hooks
