import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Form } from "react-router";
import { Input } from "./ui/input";
import { HoneypotInputs } from "remix-utils/honeypot/react";

export function SubscriptionForm() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true, amount: 0.1 }}
      className="border-border bg-card rounded-2xl border p-8 shadow-lg md:p-12"
    >
      <h2 className="mb-4 text-3xl font-bold">Stay Updated</h2>
      <p className="text-muted-foreground mb-8 text-lg">
        Subscribe to get notified about new content.
      </p>

      <Form className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
        <HoneypotInputs />
        <Input
          type="email"
          placeholder="Enter your email"
          className="focus-visible:ring-primary flex h-12 w-full rounded-full border-2 px-6 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        />
        <Button type="submit" className="h-12 rounded-full px-8">
          Subscribe
        </Button>
      </Form>

      <p className="text-muted-foreground/80 mt-4 text-sm">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </motion.div>
  );
}
