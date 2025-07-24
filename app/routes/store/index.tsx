import { ArrowDownAZ } from "lucide-react";
import { EmptyState } from "~/components/empty-state";
import { Header } from "~/components/page-header";

export default function StoreRoute() {
  return (
    <div>
      <Header title="Store" description="TekBreed Store." />
      <div className="container mx-auto my-20 w-full max-w-3xl">
        <EmptyState
          icon={<ArrowDownAZ className="size-8" />}
          title="Store Coming Soon!"
          description="We're currently developing the store. While you wait, feel free to explore our articles and tutorials."
        />
      </div>
    </div>
  );
}
