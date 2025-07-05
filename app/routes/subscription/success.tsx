import type { Route } from "./+types/success";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { addMonths, format } from "date-fns";
import {
  CheckCircle,
  CreditCard,
  ArrowRight,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { invariant } from "~/utils/misc";
import { getCheckoutSession } from "~/utils/subcription.server";
import { features } from "../home/subscription";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const checkoutId = url.searchParams.get("checkout_id");
  invariant(checkoutId, "Checkout ID is required");
  const checkout = await getCheckoutSession(checkoutId);
  return { checkout };
}

export default function SubscriptionSuccessPage({
  loaderData,
}: Route.ComponentProps) {
  const { checkout } = loaderData;
  const product = checkout.products.find((p) => p.id === checkout.productId);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "team starter":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "team pro":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "basic":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="pt-18 container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-4xl">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              Welcome to TekBreed {product!.name}! 🎉
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your subscription has been successfully activated. Let&apos;s get
              you started on your learning journey!
            </p>
          </motion.div>

          <div className="mb-12 grid items-stretch gap-8 lg:grid-cols-2">
            {/* Subscription Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-full"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Subscription Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Plan
                    </span>
                    <Badge className={getPlanColor(product!.name)}>
                      {product!.name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Amount
                    </span>
                    <span className="font-semibold">
                      ${checkout.netAmount / 100} /{product?.recurringInterval}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Status
                    </span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {checkout.status === "succeeded" ? "Active" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Next billing date
                    </span>
                    <span className="font-medium">
                      {format(
                        addMonths(new Date(checkout.createdAt), 1),
                        "MMMM d, yyyy",
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Checkout ID
                    </span>
                    <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                      {checkout.id}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    What&apos;s Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features[
                      product!.name.toLowerCase() as keyof typeof features
                    ].map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Important Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-12"
          >
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Mail className="mt-1 h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                      Confirmation Email Sent
                    </h3>
                    <p className="mb-4 text-blue-700 dark:text-blue-200">
                      We&apos;ve sent a confirmation email to{" "}
                      <strong>{checkout.customerEmail}</strong> with your
                      subscription details and receipt. Please check your inbox
                      (and spam folder if needed).
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 dark:border-blue-700"
                        asChild
                      >
                        <Link target="_blank" to={checkout.url}>
                          Manage Subscription
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
              <h2 className="mb-4 text-2xl font-bold">
                Ready to Start Learning?
              </h2>
              <p className="mx-auto mb-6 max-w-2xl text-blue-100">
                Your learning journey begins now! Explore our courses, connect
                with the community, and start building amazing projects.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  asChild
                >
                  <Link
                    to={
                      product?.name.toLowerCase() !== "premium"
                        ? "/courses"
                        : "/tutorials"
                    }
                  >
                    Start Learning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
