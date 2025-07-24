import { ArrowDownAZ } from "lucide-react";
import { EmptyState } from "~/components/empty-state";
import { Header } from "~/components/page-header";

export default function TeamsRoute() {
  return (
    <div>
      <Header title="Teams" description="TekBreed Teams." />
      <div className="container mx-auto my-20 w-full max-w-3xl">
        <EmptyState
          icon={<ArrowDownAZ className="size-8" />}
          title="Teams Coming Soon!"
          description="We're currently developing teams. While you wait, feel free to explore our articles and tutorials."
        />
      </div>
    </div>
  );
}
