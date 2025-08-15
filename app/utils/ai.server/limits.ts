// interface UserLimits {
//   tokens: {
//     monthly: number;
//     daily: number;
//   };
//   prompts: {
//     daily: number;
//     hourly: number;
//     perMinute: number;
//   };
// }

// const creditToTokenMapping = {
//   1: 5000,    // 1 credit = ~5K tokens (simple Q&A)
//   2: 10000,   // 2 credits = ~10K tokens (code explanation)
//   5: 25000,   // 5 credits = ~25K tokens (code review)
//   10: 50000,  // 10 credits = ~50K tokens (tutorial)
// };

// 200 credits ≈ 500K-800K tokens (depending on usage pattern)

// const TIER_LIMITS: Record<string, UserLimits> = {
//   free: {
//     tokens: { monthly: 50_000, daily: 2_000 },
//     prompts: { daily: 20, hourly: 5, perMinute: 2 },
//   },
//   pro: {
//     tokens: { monthly: 500_000, daily: 20_000 },
//     prompts: { daily: 200, hourly: 50, perMinute: 10 },
//   },
//   enterprise: {
//     tokens: { monthly: 2_000_000, daily: 100_000 },
//     prompts: { daily: 1000, hourly: 200, perMinute: 30 },
//   },
// };

// export async function checkAllLimits(userId: string, estimatedTokens: number) {
//   const userPlan = await getUserPlan(userId);
//   const limits = TIER_LIMITS[userPlan.type];

//   // Check prompt limits (prevents spam)
//   const promptCheck = await ratelimit.limit(`prompts:${userId}`);
//   if (!promptCheck.success) {
//     throw new Error("Too many requests. Please slow down.");
//   }

//   // Check token limits (prevents expensive usage)
//   const tokenUsage = await getUserTokenUsage(userId);
//   if (tokenUsage.monthlyTokens + estimatedTokens > limits.tokens.monthly) {
//     throw new Error("Monthly token limit exceeded.");
//   }

//   if (tokenUsage.dailyTokens + estimatedTokens > limits.tokens.daily) {
//     throw new Error("Daily token limit exceeded.");
//   }

//   return {
//     allowed: true,
//     remainingTokens: limits.tokens.monthly - tokenUsage.monthlyTokens,
//     remainingPrompts: promptCheck.remaining,
//   };
// }
