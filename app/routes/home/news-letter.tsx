import React from "react";
import { SubscriptionForm } from "~/components/email-subscription-form";

export function NewsLetterSection() {
  return (
    <section className="bg-background relative overflow-hidden py-24">
      <div className="to-background absolute inset-0 bg-gradient-to-r from-blue-500/10" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <SubscriptionForm />
        </div>
      </div>
    </section>
  );
}
