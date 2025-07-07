import { SideBarContainer } from "./side-bar-container";
import { Button } from "~/components/ui/button";
import { Share2, Bookmark, ThumbsUp, MessageSquare } from "lucide-react";
import { DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Share } from "~/components/share-content";
import type { Tutorial } from "~/utils/content.server/turorials/types";
import { Dialog } from "~/components/ui/dialog";
import { Link } from "react-router";

export function Engagement({ tutorial }: { tutorial: Tutorial }) {
  return (
    <SideBarContainer title="Engagement">
      <Dialog>
        <div className="flex justify-around p-4">
          <DialogTrigger>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-4">
            <Share
              item={tutorial}
              itemType="tutorial"
              className="mb-0 border-none p-0"
            />
          </DialogContent>

          <Button variant="outline" size="icon">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Link to={`#comments`}>
            <Button variant="outline" size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Dialog>
    </SideBarContainer>
  );
}
