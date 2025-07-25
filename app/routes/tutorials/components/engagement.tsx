import React from "react";
import { SideBarContainer } from "./sidebar-container";
import { Button } from "~/components/ui/button";
import { Share2, Bookmark, ThumbsUp, MessageSquare } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Share } from "~/components/share-content";
import type { Tutorial } from "~/utils/content.server/turorials/types";
import { Dialog } from "~/components/ui/dialog";
import { Link, useParams } from "react-router";
import { ReportButton } from "~/components/report";

export function Engagement({ tutorial }: { tutorial: Tutorial }) {
  const { tutorialId, lessonId } = useParams();
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
            <DialogHeader>
              <DialogTitle>
                <Share2 className="size-4" />
              </DialogTitle>
            </DialogHeader>
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
          <Link
            to={{
              pathname: `/tutorials/${tutorialId}${
                lessonId ? `/lessons/${lessonId}` : ""
              }`,
              hash: "#comments",
            }}
          >
            <Button variant="outline" size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
          <ReportButton
            itemId={tutorial.id}
            isFlagged={false}
            contentType="tutorial"
            size="sm"
            showText={false}
          />
        </div>
      </Dialog>
    </SideBarContainer>
  );
}
