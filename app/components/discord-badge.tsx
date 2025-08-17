import {
  DiscIcon as Discord,
  MessageCircle,
  Users,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface DiscordStats {
  memberCount?: number;
  onlineCount?: number;
  channelCount?: number;
}

interface DiscordBadgeProps {
  stats?: DiscordStats;
  showStats?: boolean;
  variant?: "simple" | "detailed";
}

export function DiscordBadge({
  stats,
  showStats = false,
  variant = "simple",
}: DiscordBadgeProps) {
  if (variant === "detailed" && showStats) {
    return (
      <div>
        <Card className="w-80 shadow-2xl">
          <CardHeader className="bg-[#5865F2] pb-3 text-white">
            <div className="flex items-center gap-2">
              <Discord className="h-5 w-5" />
              <CardTitle className="text-lg">Discord Community</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm">Members</span>
                </div>
                <Badge variant="secondary">
                  {stats?.memberCount || "1.2k+"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm">Online</span>
                </div>
                <Badge variant="secondary">
                  {stats?.onlineCount || "150+"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm">
                    Channels
                  </span>
                </div>
                <Badge variant="secondary">
                  {stats?.channelCount || "25+"}
                </Badge>
              </div>

              <Button
                asChild
                className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
              >
                <Link
                  to="https://discord.gg/7uZ6PWf4Xv"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Discord className="mr-2 h-4 w-4" />
                  Join Community
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="https://discord.gg/7uZ6PWf4Xv"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join our Discord community"
        >
          <Discord className="size-10" />
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>Join our Discord community</p>
      </TooltipContent>
    </Tooltip>
  );
}
