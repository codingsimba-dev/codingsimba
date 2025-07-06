# Subscription System Documentation

## Overview

The subscription system integrates with Polar to provide comprehensive subscription management, payment processing, and billing for the learning platform. It supports individual and team subscriptions with different pricing tiers and features.

## Architecture

### Core Components

1. **Polar Integration** - Payment processing and subscription management
2. **Subscription Tracking** - Database storage and status management
3. **Usage Limits** - AI usage and feature access control
4. **Billing Management** - Invoice and payment history

## Polar Integration

### Configuration

```typescript
import { Polar } from "@polar-sh/sdk";

const { POLAR_ACCESS_TOKEN, NODE_ENV } = process.env;
const ORGANIZATION_ID = "ae1bc13f-e313-4066-87dc-dabcd7314261";

export const polar = new Polar({
  accessToken: POLAR_ACCESS_TOKEN,
  server: NODE_ENV === "development" ? "sandbox" : "production",
});
```

### Environment Variables

```env
# Polar Configuration
POLAR_ACCESS_TOKEN=your-polar-access-token
POLAR_WEBHOOK_SECRET=your-webhook-secret
```

## Subscription Plans

### Plan Structure

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

enum SubscriptionStatus {
  active = "active",
  canceled = "canceled",
  past_due = "past_due",
  unpaid = "unpaid",
}
```

### Plan Features

#### Basic Plan

- Access to free courses and tutorials
- Basic articles and workshops
- Basic monthly coding challenges
- Discord community access
- Email support

#### Premium Plan

- Everything in Basic
- Access to all premium tutorials and workshops
- Priority community support
- Access to premium monthly coding challenges
- AI Learning Assistant (100 times/month)

#### Pro Plan

- Everything in Premium
- Access to all courses and programs
- AI Learning Assistant (unlimited)
- Advanced certificates and badges
- 1-on-1 mentorship sessions (2/month)

#### Team Plans

- **Team Starter**: Everything in Pro for each member
- **Team Pro**: Advanced team features and analytics
- **Enterprise**: Custom solutions and dedicated support

## Database Schema

### Subscription Model

```sql
model Subscription {
  id                String           @id @default(ulid())
  subscriptionId    String           @unique
  userId            String?
  teamId            String?
  status            SubscriptionStatus
  type              SubscriptionType
  plan              Plan
  amount            Int              -- Amount in cents
  currency          String           @default("USD")
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  @@index([userId])
  @@index([teamId])
  @@index([status])
}
```

### AI Usage Tracking

```sql
model AIUsage {
  id           String      @id @default(ulid())
  userId       String
  user         User        @relation(fields: [userId], references: [id])
  type         AIUsageType @default(learning_assistant)
  prompt       String
  response     String?
  tokensUsed   Int         @default(0)
  costInCents  Int         @default(0)
  success      Boolean     @default(true)
  errorMessage String?
  usageMonth   String      -- YYYY-MM format
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([userId])
  @@index([usageMonth])
  @@index([createdAt])
}
```

## API Reference

### Subscription Management

#### `createCheckoutSession(params)`

Creates a new checkout session for subscription or one-time payments.

**Parameters:**

```typescript
{
  userId?: string;
  teamId?: string;
  products: string[];
  successUrl: string;
  discountId?: string;
  customerEmail: string;
  customerName: string;
  isBusinessCustomer: boolean;
}
```

**Returns:** `Promise<CheckoutSession>`

**Example:**

```typescript
const session = await createCheckoutSession({
  userId: "user_123",
  products: ["premium_subscription"],
  successUrl: "https://example.com/success",
  customerEmail: "user@example.com",
  customerName: "John Doe",
  isBusinessCustomer: false,
});
```

#### `listProducts()`

Retrieves available products from Polar.

**Returns:** `Promise<ProductsList>`

**Example:**

```typescript
const products = await listProducts();
products.result.items.forEach((product) => {
  console.log(`${product.name}: ${product.prices?.[0]?.priceAmount}`);
});
```

#### `getSubscription(subscriptionId: string)`

Retrieves subscription details from Polar.

**Parameters:**

- `subscriptionId` (string): Polar subscription ID

**Returns:** `Promise<Subscription>`

**Example:**

```typescript
const subscription = await getSubscription("sub_123");
console.log(
  `Status: ${subscription.status}, Plan: ${subscription.product.name}`,
);
```

### Usage Management

#### `checkUserLimits(userId: string)`

Checks if user has exceeded their AI usage limits.

**Parameters:**

- `userId` (string): User ID

**Returns:** `Promise<{ canUse: boolean; usage: number; limit: number }>`

**Example:**

```typescript
const limits = await checkUserLimits(userId);
if (!limits.canUse) {
  throw new Error(`Usage limit exceeded: ${limits.usage}/${limits.limit}`);
}
```

#### `trackAIUsage(params)`

Tracks AI usage for billing and limits.

**Parameters:**

```typescript
{
  userId: string;
  type: AIUsageType;
  prompt: string;
  response?: string;
  tokensUsed: number;
  costInCents: number;
}
```

**Returns:** `Promise<AIUsage>`

**Example:**

```typescript
await trackAIUsage({
  userId: "user_123",
  type: "learning_assistant",
  prompt: "Explain React hooks",
  response: "React hooks are...",
  tokensUsed: 150,
  costInCents: 2,
});
```

## Webhook Handling

### Subscription Webhooks

```typescript
export const action = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onSubscriptionUpdated: async (subscription) => {
    try {
      const data = subscription.data;
      const productName = data.product.name.toLowerCase();
      const plan = planMap[productName] || "basic";

      const userId = data.metadata?.userId as string;
      const teamId = data.metadata?.teamId as string;

      const subscriptionData = {
        subscriptionId: data.id,
        status: data.status,
        type: (teamId ? "team" : "individual") as SubscriptionType,
        plan,
        ...(teamId ? { teamId } : { userId }),
        ...(data.currentPeriodEnd && {
          currentPeriodEnd: new Date(data.currentPeriodEnd),
        }),
        ...(data.currentPeriodStart && {
          currentPeriodStart: new Date(data.currentPeriodStart),
        }),
      };

      await prisma.subscription.upsert({
        where: { subscriptionId: data.id },
        create: subscriptionData,
        update: subscriptionData,
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  },
});
```

## Usage Examples

### Creating a Subscription

```typescript
// 1. Create checkout session
const session = await createCheckoutSession({
  userId: user.id,
  products: ["premium_subscription"],
  successUrl: `${process.env.BASE_URL}/subscription/success`,
  customerEmail: user.email,
  customerName: user.name,
  isBusinessCustomer: false,
});

// 2. Redirect user to checkout
return redirect(session.url);
```

### Managing Subscriptions

```typescript
// Get user's current subscription
const subscription = await prisma.subscription.findFirst({
  where: {
    userId: user.id,
    status: "active",
  },
  orderBy: { createdAt: "desc" },
});

// Check subscription status
if (subscription?.status === "active") {
  // User has active subscription
  const plan = subscription.plan;
  const canUseAI = await checkUserLimits(user.id);
} else {
  // User needs to subscribe
  return redirect("/subscription");
}
```

### AI Usage with Limits

```typescript
export async function handleAIRequest(userId: string, prompt: string) {
  // Check usage limits
  const limits = await checkUserLimits(userId);
  if (!limits.canUse) {
    throw new Error(
      "Monthly AI usage limit reached. Please upgrade your plan.",
    );
  }

  // Generate AI response
  const response = await generateAIResponse(prompt);

  // Track usage
  await trackAIUsage({
    userId,
    type: "learning_assistant",
    prompt,
    response: response.content,
    tokensUsed: response.usage.total_tokens,
    costInCents: calculateCost(response.usage.total_tokens),
  });

  return response;
}
```

### Team Subscription Management

```typescript
// Create team subscription
const teamSession = await createCheckoutSession({
  teamId: team.id,
  products: ["team_starter"],
  successUrl: `${process.env.BASE_URL}/team/subscription/success`,
  customerEmail: team.owner.email,
  customerName: team.name,
  isBusinessCustomer: true,
});

// Add team members to subscription
const teamMembers = await prisma.teamMember.findMany({
  where: { teamId: team.id },
  include: { user: true },
});

// Update member access based on team subscription
for (const member of teamMembers) {
  await prisma.user.update({
    where: { id: member.userId },
    data: {
      isSubscribed: true,
      plan: "pro", // Team members get Pro features
    },
  });
}
```

## Pricing Strategy

### Individual Plans

| Plan    | Price     | AI Usage    | Features                |
| ------- | --------- | ----------- | ----------------------- |
| Basic   | Free      | 0           | Limited content         |
| Premium | $9/month  | 100 prompts | Full content + AI       |
| Pro     | $19/month | Unlimited   | Everything + mentorship |

### Team Plans

| Plan         | Price      | Members   | Features                |
| ------------ | ---------- | --------- | ----------------------- |
| Team Starter | $15/member | 2-10      | Pro features per member |
| Team Pro     | $25/member | 2-50      | Advanced analytics      |
| Enterprise   | Custom     | Unlimited | Custom solutions        |

### Cost Analysis

```typescript
// AI usage costs (GPT-4o-mini)
const AI_COSTS = {
  inputTokens: 0.00015, // per 1K tokens
  outputTokens: 0.0006, // per 1K tokens
};

// Calculate cost for 100 prompts
const avgTokensPerPrompt = 700; // 200 input + 500 output
const costPerPrompt = (200 * 0.00015 + 500 * 0.0006) / 1000;
const monthlyCost = costPerPrompt * 100; // ~$0.033

// Profit margin for $9 subscription
const revenue = 900; // cents
const aiCost = 3; // cents
const profitMargin = ((revenue - aiCost) / revenue) * 100; // 99.7%
```

## Billing and Invoices

### Invoice Management

```typescript
// Get billing history
export async function getBillingHistory(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "active" },
  });

  if (!subscription) {
    return [];
  }

  // Fetch invoices from Polar
  const invoices = await polar.invoices.list({
    subscriptionId: subscription.subscriptionId,
  });

  return invoices.data;
}
```

### Payment Processing

```typescript
// Handle payment webhooks
export const paymentWebhook = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onPaymentSucceeded: async (payment) => {
    // Update subscription status
    await prisma.subscription.update({
      where: { subscriptionId: payment.subscriptionId },
      data: { status: "active" },
    });
  },
  onPaymentFailed: async (payment) => {
    // Handle failed payment
    await prisma.subscription.update({
      where: { subscriptionId: payment.subscriptionId },
      data: { status: "past_due" },
    });
  },
});
```

## Analytics and Reporting

### Subscription Metrics

```typescript
// Monthly recurring revenue
export async function calculateMRR() {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: "active" },
  });

  const mrr = activeSubscriptions.reduce((total, sub) => {
    return total + sub.amount;
  }, 0);

  return mrr / 100; // Convert cents to dollars
}

// Churn rate calculation
export async function calculateChurnRate() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const canceledThisMonth = await prisma.subscription.count({
    where: {
      status: "canceled",
      updatedAt: { gte: startOfMonth },
    },
  });

  const activeAtStart = await prisma.subscription.count({
    where: {
      status: "active",
      createdAt: { lt: startOfMonth },
    },
  });

  return (canceledThisMonth / activeAtStart) * 100;
}
```

### Usage Analytics

```typescript
// AI usage patterns
export async function getAIUsageAnalytics() {
  const usage = await prisma.aIUsage.groupBy({
    by: ["usageMonth", "type"],
    _count: { id: true },
    _sum: { tokensUsed: true, costInCents: true },
  });

  return usage.map((month) => ({
    month: month.usageMonth,
    type: month.type,
    requests: month._count.id,
    tokens: month._sum.tokensUsed,
    cost: month._sum.costInCents / 100,
  }));
}
```

## Security and Compliance

### Data Protection

```typescript
// Encrypt sensitive billing data
export function encryptBillingData(data: string): string {
  // Implement encryption for sensitive billing information
  return encryptedData;
}

// PCI compliance
export function validatePaymentData(paymentData: any) {
  // Validate payment data according to PCI standards
  // Remove sensitive data from logs
  // Implement proper error handling
}
```

### Access Control

```typescript
// Subscription access verification
export async function verifySubscriptionAccess(
  userId: string,
  feature: string,
) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "active" },
  });

  if (!subscription) {
    return false;
  }

  const planFeatures = {
    basic: ["free_content"],
    premium: ["free_content", "premium_content", "ai_assistant"],
    pro: ["free_content", "premium_content", "ai_assistant", "mentorship"],
  };

  return planFeatures[subscription.plan]?.includes(feature) || false;
}
```

## Testing

### Subscription Tests

```typescript
// Test subscription creation
test("creates subscription successfully", async () => {
  const user = await createTestUser();
  const session = await createCheckoutSession({
    userId: user.id,
    products: ["premium_subscription"],
    successUrl: "https://example.com/success",
    customerEmail: user.email,
    customerName: user.name,
    isBusinessCustomer: false,
  });

  expect(session.url).toContain("checkout");
});

// Test usage limits
test("enforces AI usage limits", async () => {
  const user = await createTestUserWithSubscription("premium");

  // Use up the limit
  for (let i = 0; i < 100; i++) {
    await trackAIUsage({
      userId: user.id,
      type: "learning_assistant",
      prompt: "Test prompt",
      tokensUsed: 100,
      costInCents: 1,
    });
  }

  const limits = await checkUserLimits(user.id);
  expect(limits.canUse).toBe(false);
});
```

## Troubleshooting

### Common Issues

1. **Webhook Failures**

   - Verify webhook secret
   - Check endpoint availability
   - Monitor webhook logs

2. **Payment Failures**

   - Validate payment method
   - Check subscription status
   - Review error messages

3. **Usage Limit Issues**
   - Verify subscription status
   - Check usage calculations
   - Review plan limits

### Debug Tools

```typescript
// Subscription debugging
export async function debugSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { subscriptionId },
    include: { user: true },
  });

  console.log("Subscription:", subscription);

  const polarSubscription = await getSubscription(subscriptionId);
  console.log("Polar subscription:", polarSubscription);

  return { db: subscription, polar: polarSubscription };
}
```

## Related Files

- `app/utils/subcription.server.ts` - Polar integration
- `app/routes/subscription/` - Subscription routes
- `prisma/schema/subscription.prisma` - Subscription schema
- `app/routes/home/subscription.tsx` - Subscription UI
- `app/utils/ai.server.ts` - AI usage tracking
