import type { Route } from "./+types";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Await, useLoaderData } from "react-router";
import { FAQAccordion } from "~/components/faq-accordion";

export function FAQSection() {
  const loaderData = useLoaderData<Route.ComponentProps["loaderData"]>();
  const faqs = loaderData.faqs;

  return (
    <section className="from-muted/30 via-background to-muted/20 relative overflow-hidden bg-gradient-to-br py-24">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mx-auto mb-20 max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
          >
            <span className="mr-2">❓</span>
            Got Questions?
          </motion.div>

          <h2 className="text-foreground mb-6 text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Find answers to common questions about our platform and services.
          </p>
        </motion.div>

        <Suspense fallback={<FAQAccordion.Skeleton />}>
          <Await resolve={faqs} errorElement={<FaqError />}>
            {(resolvedFaqs) => (
              <FAQAccordion
                faqs={resolvedFaqs}
                showCallToAction={true}
                callToActionText="Contact Support"
                callToActionLink="/support"
              />
            )}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

function FaqError() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 text-center"
    >
      <div className="text-destructive mb-4 text-6xl">⚠️</div>
      <h3 className="text-foreground mb-2 text-xl font-semibold">
        Something went wrong
      </h3>
      <p className="text-muted-foreground">
        We couldn&apos;t load the FAQs. Please try again later.
      </p>
    </motion.div>
  );
}
