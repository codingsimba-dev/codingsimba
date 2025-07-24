import { SideBarContainer } from "./sidebar-container";
import type { Tutorial } from "~/utils/content.server/turorials/types";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/empty-state";
import { Tag } from "lucide-react";

export function Tags({ tutorial }: { tutorial: Tutorial }) {
  if (!tutorial.tags?.length)
    return (
      <EmptyState
        icon={<Tag className="size-8 text-gray-400" />}
        title="No tags yet"
        description="Tags help you find related tutorials and topics."
        className="pt-4"
      />
    );
  return (
    <SideBarContainer title="Tags">
      <div className="flex flex-wrap gap-2 p-4">
        {tutorial.tags.map((tag) => (
          <Link
            key={tag.id}
            to={{
              pathname: "/tutorials",
              search: `?tag=${tag.id}`,
            }}
            className="hover:underline"
          >
            <Badge key={tag.id} variant="secondary">
              {tag.title}
            </Badge>
          </Link>
        ))}
      </div>
    </SideBarContainer>
  );
}
