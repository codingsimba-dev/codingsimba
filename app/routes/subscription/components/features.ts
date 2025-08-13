/**
 * Enhanced feature definitions for each subscription plan with AI assistant options
 *
 * Maps plan names to their feature lists. Includes base features and AI assistant features
 * that can be toggled on/off for flexible pricing.
 */

// Base features without AI assistant
export const baseFeatures = {
  basic: [
    "Access to free courses and tutorials",
    "Basic articles and workshops",
    "Basic monthly coding challenges",
    "Discord community access",
    "Email support",
  ],
  premium: [
    "Everything in Basic",
    "Access to Tekbreed chat",
    "Access to all premium tutorials and workshops",
    "Priority community support",
    "Access to premium monthly coding challenges",
  ],
  pro: [
    "Everything in Premium",
    "Skills assessment tools",
    "Access to all courses and programs",
    "Advanced certificates and badges",
    "1-on-1 mentorship sessions (2/month)",
  ],
  "team starter": [
    "Everything in Pro for each member",
    "Team dashboard and analytics",
    "Progress tracking for all members",
    "Team certificates",
    "Basic team reporting",
    "Email support",
  ],
  "team pro": [
    "Everything in Team Starter",
    "Custom learning paths",
    "Advanced team analytics",
    "Skills assessment tools",
    "Integration with Slack/Teams",
  ],
  enterprise: [
    "Everything in Team Pro",
    "Unlimited team members",
    "Custom integrations",
    "Dedicated account manager",
    "Custom branding",
  ],
};

// AI Assistant features by tier
export const aiFeatures = {
  basic: "AI Learning Assistant (50 credits/month)",
  premium: "AI Learning Assistant (200 credits/month)",
  pro: "AI Learning Assistant (Unlimited credits)",
  "team starter": "AI Learning Assistant (Unlimited credits per member)",
  "team pro": "AI Learning Assistant (Unlimited credits per member)",
  enterprise: "AI Learning Assistant (Unlimited credits per member)",
  "ai-only": [
    "AI Learning Assistant (Unlimited credits)",
    "Code review and suggestions",
    "Personalized learning recommendations",
    "24/7 AI-powered support",
    "Integration with popular IDEs",
    "Custom AI model fine-tuning",
  ],
};

// AI Assistant pricing (monthly)
export const aiPricing = {
  basic: 9,
  premium: 15,
  pro: 25,
  "team starter": 20,
  "team pro": 30,
  enterprise: 40,
  "ai-only": 19,
};

/**
 * Combines base features with AI features when AI assistant is enabled
 */
export function getFeaturesWithAI(planName: string, includeAI = false) {
  const basePlanFeatures =
    baseFeatures[planName.toLowerCase() as keyof typeof baseFeatures] || [];
  if (!includeAI) {
    return basePlanFeatures;
  }

  const aiFeature =
    aiFeatures[planName.toLowerCase() as keyof typeof aiFeatures];

  if (Array.isArray(aiFeature)) {
    return [...basePlanFeatures, ...aiFeature];
  } else if (typeof aiFeature === "string") {
    return [...basePlanFeatures, aiFeature];
  }

  return basePlanFeatures;
}

/**
 * Gets the AI assistant pricing for a specific plan
 */
export function getAIPricing(planName: string): number {
  return aiPricing[planName.toLowerCase() as keyof typeof aiPricing] || 0;
}
