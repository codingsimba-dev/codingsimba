import { ArrowDownAZ } from "lucide-react";
import { EmptyState } from "~/components/empty-state";
import { Header } from "~/components/page-header";

export default function JobBoardRoute() {
  return (
    <div>
      <Header title="Job Board" description="TekBreed Job Board." />
      <div className="container mx-auto my-20 w-full max-w-3xl">
        <EmptyState
          icon={<ArrowDownAZ className="size-8" />}
          title="Job Board Coming Soon!"
          description="We're currently developing the job board. While you wait, feel free to explore our articles and tutorials."
        />
      </div>
    </div>
  );
}
