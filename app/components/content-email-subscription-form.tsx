import { useFetcher } from "react-router";
import { Bookmark } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
// import { useForm } from "@conform-to/react";

export function ContentEmailSubscriptionForm() {
  const fetcher = useFetcher();
  // const [form, fields] = useForm({
  //   id: "subscription-form",
  //   lastSubmission: fetcher.data,
  //   onValidate: ({ formData }) => {},
  // });
  return (
    <div className="border-border bg-card mb-6 rounded-xl border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Subscribe</h3>
        <Bookmark className="text-muted-foreground h-5 w-5" />
      </div>
      <p className="text-muted-foreground mb-4">
        Get the latest articles, tutorials, and new content sent straight to
        your inbox.
      </p>
      <fetcher.Form method="post" className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email"
          className="border-border bg-background text-foreground w-full rounded-lg border px-4 py-2"
        />
        <Button type="submit" className="w-full">
          Subscribe
        </Button>
      </fetcher.Form>
    </div>
  );
}
