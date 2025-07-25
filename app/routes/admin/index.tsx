import type { Route } from "./+types/index";
import { requireUserWithRole } from "~/utils/permissions.server";
import { Header } from "~/components/page-header";
import { EmptyState } from "~/components/empty-state";
import { ArrowDownAZ } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserWithRole(request, "ADMIN");
  return {};
}

export default function AdminRoute() {
  return (
    <div>
      <Header title="Admin" description="TekBreed Admin." />
      <div className="container mx-auto my-20 w-full max-w-3xl">
        <EmptyState
          icon={<ArrowDownAZ className="size-8" />}
          title="Admin Panel Coming Soon!"
          description="We're currently developing the admin panel. While you wait, feel free to explore our articles and tutorials."
        />
      </div>
    </div>
  );
}
