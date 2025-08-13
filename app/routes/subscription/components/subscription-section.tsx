import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Bot } from "lucide-react";
import { PricingCard } from "./pricing-card";

// Mock data - replace with your actual data structure
const mockPlans = {
  individual: [
    {
      name: "basic",
      description: "Perfect for getting started with coding",
      metadata: {
        group: "individual",
        icon: "Zap",
        buttonText: "Get Started",
        buttonVariant: "outline",
      },
      prices: [{ amountType: "free" }],
    },
    {
      name: "premium",
      description: "For serious learners who want more",
      metadata: {
        group: "individual",
        popular: true,
        icon: "Star",
        buttonText: "Start Premium",
        buttonVariant: "default",
      },
      prices: [
        { amountType: "fixed", priceAmount: 2900, recurringInterval: "month" },
      ],
    },
    {
      name: "pro",
      description: "Everything you need to master coding",
      metadata: {
        group: "individual",
        icon: "Crown",
        buttonText: "Go Pro",
        buttonVariant: "default",
      },
      prices: [
        { amountType: "fixed", priceAmount: 4900, recurringInterval: "month" },
      ],
    },
  ],
  team: [
    {
      name: "team starter",
      description: "Perfect for small development teams",
      metadata: {
        group: "team",
        icon: "Users",
        buttonText: "Start Team Plan",
        buttonVariant: "outline",
        minSeats: "3",
        maxMembers: "10",
        perSeat: true,
      },
      prices: [
        { amountType: "fixed", priceAmount: 3900, recurringInterval: "month" },
      ],
    },
    {
      name: "team pro",
      description: "Advanced features for growing teams",
      metadata: {
        group: "team",
        popular: true,
        icon: "Users",
        buttonText: "Upgrade Team",
        buttonVariant: "default",
        minSeats: "5",
        maxMembers: "50",
        perSeat: true,
      },
      prices: [
        { amountType: "fixed", priceAmount: 5900, recurringInterval: "month" },
      ],
    },
    {
      name: "enterprise",
      description: "Custom solutions for large organizations",
      metadata: {
        group: "team",
        icon: "Crown",
        buttonText: "Contact Sales",
        buttonVariant: "outline",
        minSeats: "50",
      },
      prices: [{ amountType: "custom" }],
    },
  ],
};

// AI-only plan
const aiOnlyPlan = {
  name: "ai-assistant",
  description: "Standalone AI assistant for coding and learning",
  metadata: {
    group: "ai",
    icon: "Bot",
    buttonText: "Get AI Assistant",
    buttonVariant: "default",
  },
  prices: [
    { amountType: "fixed", priceAmount: 1900, recurringInterval: "month" },
  ],
};

export function SubscriptionSection() {
  const [aiToggles, setAiToggles] = useState<Record<string, boolean>>({});

  const handleAIToggle = (planName: string, enabled: boolean) => {
    setAiToggles((prev) => ({
      ...prev,
      [planName]: enabled,
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPriceAmount = (price: any): number => {
    if (price?.amountType === "fixed" && "priceAmount" in price) {
      return price.priceAmount / 100;
    }
    return 0;
  };

  return (
    <section className="bg-background relative overflow-hidden py-24">
      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-4 text-4xl font-bold"
          >
            Choose Your Learning Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-muted-foreground mx-auto max-w-2xl text-xl"
          >
            Flexible pricing with optional AI assistant. Mix and match to create
            your perfect learning experience.
          </motion.p>
        </div>

        <Tabs defaultValue="individual" className="mx-auto max-w-7xl">
          <TabsList className="mx-auto mb-12 flex w-fit">
            <TabsTrigger value="individual" className="py-3 text-lg">
              Individual Plans
            </TabsTrigger>
            <TabsTrigger value="team" className="py-3 text-lg">
              Team Plans
            </TabsTrigger>
            <TabsTrigger value="ai-only" className="py-3 text-lg">
              <Bot className="mr-2 size-4" />
              AI Assistant Only
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
              {mockPlans.individual.map((plan, index) => (
                <PricingCard
                  key={plan.name}
                  plan={plan}
                  index={index}
                  basePrice={getPriceAmount(plan.prices[0])}
                  onAIToggle={handleAIToggle}
                  aiEnabled={aiToggles[plan.name] || false}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-8">
              <div className="mx-auto max-w-4xl text-center">
                <h3 className="mb-4 text-2xl font-bold">Team Plans</h3>
                <p className="text-muted-foreground">
                  Collaborate, learn, and grow together. All team plans include
                  advanced analytics and management tools.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {mockPlans.team.map((plan, index) => (
                  <PricingCard
                    key={plan.name}
                    plan={plan}
                    index={index}
                    basePrice={getPriceAmount(plan.prices[0])}
                    onAIToggle={handleAIToggle}
                    aiEnabled={aiToggles[plan.name] || false}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-only">
            <div className="space-y-8">
              <div className="mx-auto max-w-4xl text-center">
                <h3 className="mb-4 text-2xl font-bold">AI Assistant Only</h3>
                <p className="text-muted-foreground">
                  Get our powerful AI assistant without a full subscription.
                  Perfect for developers who want AI-powered coding help.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <PricingCard
                    plan={aiOnlyPlan}
                    index={0}
                    basePrice={getPriceAmount(aiOnlyPlan.prices[0])}
                    isAIOnly={true}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          {/* <p className="text-muted-foreground mb-4">
            All plans include a 14-day free trial
          </p> */}
          <div className="text-muted-foreground/80 flex flex-wrap justify-center gap-8 text-sm">
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Secure payments</span>
            <span>✓ 24/7 support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
