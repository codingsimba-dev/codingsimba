import React from "react";
import { z } from "zod";
import type { Route } from "../+types/index";
import { motion } from "framer-motion";
import { useActionData, useFetcher, useLoaderData } from "react-router";
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { cn } from "~/utils/misc";

import { Container } from "./container";

export const UPDATE_NOTIFICATIONS_INTENT = "update-notifications";

const stringToBoolean = z.union([z.string(), z.boolean()]).transform((val) => {
  if (typeof val === "boolean") return val;
  return val.toLowerCase() === "true";
});

export const NotificationSettingsSchema = z.object({
  userId: z.string(),
  contentUpdate: stringToBoolean,
  promotions: stringToBoolean,
  communityEvents: stringToBoolean,
  allNotifications: stringToBoolean,
});

export function Notifications() {
  const fetcher = useFetcher();
  const actionData = useActionData() as Route.ComponentProps["actionData"];
  const loaderData = useLoaderData() as Route.ComponentProps["loaderData"];
  const notifications = loaderData.user.notificationSettings;
  const turnAllOn = notifications?.allNotifications;

  function handleSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    fetcher.submit(
      {
        ...notifications,
        [e.currentTarget.name]: e.currentTarget.checked,
        userId: loaderData.user.id,
        intent: UPDATE_NOTIFICATIONS_INTENT,
      },
      { method: "post" },
    );
  }

  const [, fields] = useForm({
    id: "notifications",
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NotificationSettingsSchema });
    },
    shouldValidate: "onBlur",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container title="Notifications">
        <div className="space-y-6">
          <Toggle
            {...getInputProps(fields.allNotifications, { type: "checkbox" })}
            label="Receive all notifications"
            description="Receive all updates straight to your inbox"
            defaultChecked={turnAllOn}
            onChange={handleSubmit}
          />

          <Toggle
            {...getInputProps(fields.contentUpdate, { type: "checkbox" })}
            label="Content updates"
            description="Get notified about new content and updates"
            checked={notifications?.contentUpdate || turnAllOn}
            onChange={handleSubmit}
          />

          <Toggle
            {...getInputProps(fields.promotions, { type: "checkbox" })}
            label="Promotions"
            description="Receive promotional offers and discounts"
            checked={notifications?.promotions || turnAllOn}
            onChange={handleSubmit}
          />

          <Toggle
            {...getInputProps(fields.communityEvents, { type: "checkbox" })}
            label="Community events"
            description="Stay updated with community activities"
            checked={notifications?.communityEvents || turnAllOn}
            onChange={handleSubmit}
          />
        </div>
      </Container>
    </motion.div>
  );
}

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export function Toggle({
  label,
  description,
  className,
  ...props
}: ToggleProps) {
  return (
    <div className="border-border flex items-center justify-between border-b pb-4">
      {(label || description) && (
        <div>
          {label && <div className="font-medium">{label}</div>}
          {description && (
            <div className="text-muted-foreground text-sm">{description}</div>
          )}
        </div>
      )}
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className={cn("peer sr-only", className)}
          {...props}
        />
        <div className="bg-muted after:border-border after:bg-background peer-checked:bg-primary peer-checked:after:border-background peer-focus:ring-primary peer h-6 w-11 rounded-full after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 rtl:peer-checked:after:-translate-x-full" />
      </label>
    </div>
  );
}
