import { Heart, MessageSquare, Eye } from "lucide-react";

interface EngagementMetricsProps {
  likeCount: number;
  commentCount: number;
  viewCount: number;
  userLikes: number;
  onLike: () => void;
}

export function EngagementMetrics({
  likeCount,
  commentCount,
  viewCount,
  userLikes,
  onLike,
}: EngagementMetricsProps) {
  return (
    <div className="mb-8 flex flex-col items-center justify-between border-b border-gray-200 py-4 dark:border-gray-800">
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <button
            onClick={onLike}
            disabled={userLikes >= 5}
            className={`flex items-center space-x-1 ${
              userLikes >= 5
                ? "cursor-not-allowed opacity-50"
                : "hover:text-red-500 dark:hover:text-red-400"
            }`}
          >
            <Heart
              className={`h-5 w-5 ${
                userLikes > 0
                  ? "fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400"
                  : ""
              }`}
            />
            <span>{likeCount}</span>
          </button>
          {userLikes > 0 && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              You liked {userLikes} {userLikes === 1 ? "time" : "times"}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <MessageSquare className="h-5 w-5" />
          <span>{commentCount}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Eye className="h-5 w-5" />
          <span>{viewCount.toLocaleString()} views</span>
        </div>
      </div>
    </div>
  );
}
