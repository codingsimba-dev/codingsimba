import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Users, Zap, Crown, Bot } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/utils/misc";
import { getFeaturesWithAI, getAIPricing } from "./features";

interface PricingCardProps {
  plan: {
    name: string;
    description: string;
    metadata: {
      group: string;
      popular?: boolean;
      icon?: string;
      buttonText: string;
      buttonVariant?: string;
      originalPrice?: string;
      minSeats?: string;
      maxMembers?: string;
      perSeat?: boolean;
    };
    prices: Array<{
      amountType: string;
      priceAmount?: number;
      recurringInterval?: string;
    }>;
  };
  index: number;
  basePrice: number;
  isAIOnly?: boolean;
  onAIToggle?: (planName: string, enabled: boolean) => void;
  aiEnabled?: boolean;
}

export function PricingCard({
  plan,
  index,
  basePrice,
  isAIOnly = false,
  onAIToggle,
  aiEnabled = false,
}: PricingCardProps) {
  const [localAIEnabled, setLocalAIEnabled] = useState(aiEnabled);
  const price = plan.prices?.[0];
  const isCustom = price?.amountType === "custom";
  const isFree = price?.amountType === "free" || basePrice === 0;
  const isPopular = !!plan.metadata.popular;
  const isTeam = plan.metadata.group === "team";

  const aiPrice = getAIPricing(plan.name);
  const totalPrice = isAIOnly
    ? aiPrice
    : localAIEnabled
      ? basePrice + aiPrice
      : basePrice;
  const features = isAIOnly
    ? getFeaturesWithAI("ai-only", true)
    : getFeaturesWithAI(plan.name, localAIEnabled);

  const handleAIToggle = (enabled: boolean) => {
    setLocalAIEnabled(enabled);
    onAIToggle?.(plan.name, enabled);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="size-5" />;
      case "Star":
        return <Star className="size-5" />;
      case "Crown":
        return <Crown className="size-5" />;
      case "Users":
        return <Users className="size-5" />;
      case "Bot":
        return <Bot className="size-5" />;
      default:
        return <Star className="size-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={cn(
        "bg-card relative flex flex-col rounded-2xl border p-8 shadow-lg",
        "border-border",
        {
          "border-primary ring-primary/20 ring-2": isPopular,
          "border-blue-500 ring-2 ring-blue-500/20": isAIOnly,
        },
      )}
    >
      {isPopular && !isAIOnly && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <div className="bg-primary text-primary-foreground flex items-center gap-1 rounded-full px-4 py-1 text-sm font-medium">
            <Star className="size-4 fill-current" />
            Most Popular
          </div>
        </div>
      )}

      {isAIOnly && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <div className="flex items-center gap-1 rounded-full bg-blue-500 px-4 py-1 text-sm font-medium text-white">
            <Bot className="size-4" />
            AI Only
          </div>
        </div>
      )}

      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          {getIcon(isAIOnly ? "Bot" : (plan.metadata.icon as string))}
          <h3 className="text-2xl font-bold capitalize">
            {isAIOnly ? "AI Assistant" : plan.name}
          </h3>
        </div>

        {/* Pricing Display */}
        <div className="mb-4 space-y-2">
          {!isAIOnly && !isFree && !isCustom && (
            <div className="text-muted-foreground text-sm">
              Base Plan: ${basePrice}
              {isTeam ? "/per seat" : ""}/month
            </div>
          )}

          {!isAIOnly && localAIEnabled && (
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-500">
              + AI Assistant: ${aiPrice}
              {isTeam ? "/per seat" : ""}/month
            </div>
          )}

          <div className="text-4xl font-bold">
            {isFree && !localAIEnabled
              ? "Free"
              : isCustom
                ? "Custom"
                : `$${totalPrice}`}
          </div>

          {plan.metadata.originalPrice && (
            <span className="text-muted-foreground ml-2 text-lg line-through">
              ${plan.metadata.originalPrice}
            </span>
          )}

          {!isFree && !isCustom && (
            <span className="text-muted-foreground text-sm">
              {isTeam ? "/per seat " : ""}
              {!isAIOnly
                ? `/ ${price?.recurringInterval || "month"}`
                : "/ month"}
            </span>
          )}
        </div>

        {/* AI Assistant Toggle */}
        {!isAIOnly && !isCustom ? (
          <div className="bg-muted/50 mb-4 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-blue-500" />
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <Switch
                checked={localAIEnabled}
                onCheckedChange={handleAIToggle}
              />
            </div>
            {localAIEnabled ? (
              <Badge variant={"secondary"}>
                +${aiPrice}
                {isTeam ? "/seat" : ""}/month
              </Badge>
            ) : null}
          </div>
        ) : null}

        {plan.metadata.minSeats && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              Minimum {plan.metadata.minSeats} members
            </Badge>
          </div>
        )}

        {plan.metadata.maxMembers && Number(plan.metadata.maxMembers) < 999 && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              Up to {plan.metadata.maxMembers} members
            </Badge>
          </div>
        )}

        <p className="text-muted-foreground">
          {isAIOnly
            ? "Your personal AI coding mentor with intelligent code analysis and instant expert guidance for accelerated software engineering mastery"
            : plan.description}
        </p>
      </div>

      {/* Features List */}
      <ul className="mb-8 flex-grow space-y-4">
        {features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start gap-3">
            <Check className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
            <span className="text-card-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <Button
        className={cn("w-full py-6 text-lg", {
          "bg-primary text-primary-foreground hover:bg-primary/90": isPopular,
          "bg-blue-500 text-white hover:bg-blue-600": isAIOnly,
        })}
        variant={plan.metadata.buttonVariant as "default" | "outline"}
      >
        {isAIOnly ? "Get AI Assistant" : plan.metadata.buttonText}
      </Button>

      {/* Pricing Example for Team Plans */}
      {plan.metadata.perSeat && !isCustom && (
        <div className="mt-4 text-center">
          <p className="text-muted-foreground text-xs">
            Example: 10 members = ${totalPrice * 10}/month
          </p>
        </div>
      )}
    </motion.div>
  );
}
