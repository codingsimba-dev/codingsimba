import type { Route } from "./+types";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Await, useLoaderData } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";
import { Markdown } from "~/components/mdx";

function FaqSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border-border bg-card overflow-hidden rounded-lg border p-6 shadow-sm"
        >
          <Skeleton className="h-6 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function FAQSection() {
  const loaderData = useLoaderData<Route.ComponentProps["loaderData"]>();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const faqs = loaderData.faqs;

  return (
    <section className="bg-muted/30 relative overflow-hidden py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

      {/* Gradient overlays */}
      <div className="absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute right-0 top-0 h-1/3 w-1/3 rounded-full bg-blue-400/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-1/3 w-1/3 rounded-full bg-blue-300/5 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about our platform and services.
          </p>
        </motion.div>

        <div className="mx-auto max-w-4xl">
          <Suspense fallback={<FaqSkeleton />}>
            <Await
              resolve={faqs}
              errorElement={
                <p>Oh no! Something went wrong loading the FAQs.</p>
              }
            >
              {(resolvedFaqs) => {
                return (
                  <div className="space-y-4">
                    {resolvedFaqs.filter(Boolean).map((faq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="border-border bg-card overflow-hidden rounded-lg border shadow-sm backdrop-blur-sm"
                      >
                        <button
                          onClick={() => toggleExpanded(index)}
                          className="hover:bg-primary/5 flex w-full items-center justify-between p-6 text-left transition-colors"
                        >
                          <span className="text-foreground pr-4 font-medium">
                            {faq?.frontmatter.question}
                          </span>
                          {expandedIndex === index ? (
                            <ChevronUp className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                          )}
                        </button>

                        {expandedIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-border border-t"
                          >
                            <div className="px-6">
                              <Markdown source={faq!.content} />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                );
              }}
            </Await>
          </Suspense>
        </div>
      </div>
    </section>
  );
}
