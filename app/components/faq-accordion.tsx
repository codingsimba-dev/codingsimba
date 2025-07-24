import { useState } from "react";
import type { FAQ } from "~/utils/content.server/system/types";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/utils/misc";

interface FAQAccordionProps {
  faqs: FAQ[];
  showSearch?: boolean;
  className?: string;
  maxWidth?: string;
  showCallToAction?: boolean;
  callToActionText?: string;
  callToActionLink?: string;
}

function FaqSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="border-border bg-card/50 overflow-hidden rounded-xl border p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
        >
          <Skeleton className="mb-3 h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </motion.div>
      ))}
    </div>
  );
}

function CallToAction({ text, link }: { text?: string; link?: string }) {
  if (!text || !link) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      viewport={{ once: true }}
      className="mt-16 text-center"
    >
      <p className="text-muted-foreground mb-4 text-lg">
        Still have questions?
      </p>
      <a
        href={link}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-lg px-6 py-3 font-semibold transition-colors duration-200"
      >
        {text}
        <span className="ml-2">→</span>
      </a>
    </motion.div>
  );
}

export function FAQAccordion({
  faqs,
  showSearch = false,
  className = "",
  maxWidth = "max-w-4xl",
  showCallToAction = false,
  callToActionText = "Contact Support",
  callToActionLink = "/support",
}: FAQAccordionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = faqs.filter((faq) => {
    if (!searchTerm) return true;
    return (
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className={cn("mx-auto", maxWidth, className)}>
      {showSearch && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Accordion type="single" collapsible className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <AccordionItem
                value={faq.question}
                className="border-border bg-card/50 hover:bg-card/70 overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <span className="text-foreground text-lg font-semibold">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>

      {showCallToAction && (
        <CallToAction text={callToActionText} link={callToActionLink} />
      )}
    </div>
  );
}

// Export skeleton for use in suspense boundaries
FAQAccordion.Skeleton = FaqSkeleton;
