import type { FAQ } from "~/utils/content.server/system/types";
import { getFAQs } from "~/utils/content.server/system/utils";
import { Suspense } from "react";
import { Await, Link, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FAQAccordion } from "~/components/faq-accordion";
import { Header } from "~/components/page-header";

export async function loader() {
  const faqs = getFAQs();
  return { faqs };
}

export default function SupportPage() {
  return (
    <>
      <Header
        title="Support Center"
        description="Get help with your account, billing, and technical issues."
      />

      <div className="container mx-auto my-20 w-full max-w-6xl space-y-12">
        {/* Support Options */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📧</span>
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="text-muted-foreground mb-4">
                Send us an email and we&apos;ll get back to you within 24 hours.
              </p>
              <Link
                to="mailto:support@tekbreed.com"
                target="_blank"
                className="mt-auto w-full"
              >
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="text-muted-foreground mb-4">
                Chat with our support team in real-time.
              </p>
              <Link to="/chat" className="mt-auto w-full">
                <Button variant="outline" className="w-full">
                  Start Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📞</span>
                Phone Support
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="text-muted-foreground mb-4">
                Phone support available for team accounts and enterprise
                customers.
              </p>
              <div className="mt-auto flex items-center justify-center">
                <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-3 py-1 text-sm font-medium">
                  Teams Only
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Find quick answers to common questions below.
            </p>
          </div>
          <FAQSection />
        </div>
      </div>
    </>
  );
}

function FAQSection() {
  const loaderData = useLoaderData() as { faqs: Promise<FAQ[]> };
  const faqs = loaderData.faqs;

  return (
    <Suspense fallback={<FAQAccordion.Skeleton />}>
      <Await
        resolve={faqs}
        errorElement={
          <p className="text-muted-foreground text-center">
            Oh no! Something went wrong loading the FAQs.
          </p>
        }
      >
        {(resolvedFaqs) => (
          <FAQAccordion
            faqs={resolvedFaqs}
            showSearch={true}
            className="space-y-6"
          />
        )}
      </Await>
    </Suspense>
  );
}
