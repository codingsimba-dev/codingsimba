/**
 * Feature definitions for each subscription plan
 *
 * Maps plan names to their feature lists. Used to display features
 * in the pricing cards based on the plan type.
 */
export const features = {
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
    "AI Learning Assistant (Limited credits/month)",
  ],
  pro: [
    "Everything in Premium",
    "Skills assessment tools",
    "Access to all courses and programs",
    "AI Learning Assistant (Unlimited credits)",
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
