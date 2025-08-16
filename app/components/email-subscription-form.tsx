import React from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useFetcher } from "react-router";
import { Input } from "./ui/input";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { FormError } from "./form-errors";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "~/utils/user-validation";
import { toast } from "sonner";
import { Loader } from "lucide-react";

export const SubscriptionSchema = z.object({
  name: z
    .string()
    .min(
      USERNAME_MIN_LENGTH,
      `Name must be atleast ${USERNAME_MIN_LENGTH} characters.`,
    )
    .max(
      USERNAME_MAX_LENGTH,
      `Name must be atmost ${USERNAME_MAX_LENGTH} characters.`,
    )
    .optional(),
  email: z
    .string({ required_error: "Email is required." })
    .email("Invalid email address"),
});

export function SubscriptionForm() {
  const fetcher = useFetcher();
  const [form, fields] = useForm({
    id: "subscription",
    lastResult: fetcher?.data?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SubscriptionSchema });
    },
    shouldValidate: "onSubmit",
  });

  React.useEffect(() => {
    if (fetcher.data?.response?.status === "success") {
      toast.success("Thank you for subscribing!", {
        description: "Check your email to confirm your subscription.",
      });
      form.reset();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data?.response?.status]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true, amount: 0.1 }}
      className="border-border bg-card rounded-2xl border p-8 shadow-lg md:p-12"
    >
      <h2 className="mb-4 text-3xl font-bold">Stay Updated</h2>
      <p className="text-muted-foreground mb-4 text-lg">
        Subscribe to get notified about new content.
      </p>

      <fetcher.Form
        {...getFormProps(form)}
        method="post"
        action="/subscribe"
        className="mx-auto max-w-lg gap-4 sm:flex-row"
      >
        <HoneypotInputs />
        <div className="mx-auto mb-4 flex flex-col gap-4 md:flex-row">
          <div className="w-full">
            <Input
              {...getInputProps(fields.name, { type: "text" })}
              name="name"
              placeholder="Tony Max"
              className="focus-visible:ring-primary mb-2 flex h-12 w-full rounded-full border-2 px-6 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
            />
            <FormError errors={fields.name.errors} />
          </div>
          <div className="w-full">
            <Input
              {...getInputProps(fields.email, { type: "email" })}
              name="email"
              placeholder="tonymax@tekbreed.com"
              className="focus-visible:ring-primary mb-2 flex h-12 w-full rounded-full border-2 px-6 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
            />
            <FormError errors={fields.email.errors} />
          </div>
        </div>
        <Button
          type="submit"
          disabled={fetcher.state !== "idle"}
          className="h-12 rounded-full px-8"
        >
          Subscribe{" "}
          {fetcher.state !== "idle" ? (
            <Loader className="ml-2 animate-spin" />
          ) : null}
        </Button>
        <FormError errors={form.allErrors.root || form.errors} />
      </fetcher.Form>

      <p className="text-muted-foreground/80 mt-4 text-sm">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </motion.div>
  );
}
