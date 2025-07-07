import { SideBarContainer } from "./side-bar-container";
import { Eye, Heart, MessageSquare } from "lucide-react";

export function Stats({
  stats,
}: {
  stats: { viewCount: number; likeCount: number; commentCount: number };
}) {
  return (
    <SideBarContainer title="Stats">
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-600 dark:text-gray-300">
            <Eye className="mr-2 h-4 w-4" />
            Views
          </span>
          <span className="font-medium">
            {stats.viewCount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-600 dark:text-gray-300">
            <Heart className="mr-2 h-4 w-4" />
            Likes
          </span>
          <span className="font-medium">{stats.likeCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-600 dark:text-gray-300">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comments
          </span>
          <span className="font-medium">{stats.commentCount}</span>
        </div>
      </div>
    </SideBarContainer>
  );
}
