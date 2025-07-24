import { ArrowDownAZ } from "lucide-react";
import { EmptyState } from "~/components/empty-state";
import { Header } from "~/components/page-header";

export default function SubscriptionRoute() {
  return (
    <div>
      <Header title="Subscription" description="TekBreed Subscription." />
      <div className="container mx-auto my-20 w-full max-w-3xl">
        <EmptyState
          icon={<ArrowDownAZ className="size-8" />}
          title="Subscription Coming Soon!"
          description="We're currently developing the subscription. While you wait, feel free to explore our articles and tutorials."
        />
      </div>
    </div>
  );
}
