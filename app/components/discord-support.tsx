import { useState } from "react";
import { motion } from "framer-motion";
import {
  DiscIcon as Discord,
  MessageCircle,
  Users,
  BookOpen,
  ExternalLink,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";

interface DiscordSupportProps {
  showStats?: boolean;
  stats?: {
    memberCount?: number;
    onlineCount?: number;
    channelCount?: number;
    responseTime?: string;
  };
}

export function DiscordSupport({
  showStats = true,
  stats,
}: DiscordSupportProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultStats = {
    memberCount: 1200,
    onlineCount: 150,
    channelCount: 25,
    responseTime: "< 5 minutes",
    ...stats,
  };

  const supportChannels = [
    {
      name: "general-support",
      title: "General Support",
      description: "General questions and help",
      icon: MessageCircle,
      color: "bg-blue-500",
    },
    {
      name: "technical-help",
      title: "Technical Help",
      description: "Code issues and technical problems",
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      name: "course-help",
      title: "Course Help",
      description: "Questions about courses and lessons",
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary/20 from-primary/5 border-2 bg-gradient-to-br to-transparent">
          <CardHeader className="flex w-full items-center bg-[#5865F2] py-2 text-white">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Discord className="size-6" />
                <div>
                  <CardTitle className="text-xl">
                    Discord Community Support
                  </CardTitle>
                  <p className="text-sm text-white/80">
                    Join our active Discord community for instant help
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:bg-white/20"
              >
                {isExpanded ? "Show Less" : "Show More"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-semibold">Why Discord?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">
                      Instant responses from community
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">
                      Direct access to instructors
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">
                      Code sharing and collaboration
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">
                      Study groups and peer learning
                    </span>
                  </div>
                </div>
              </div>

              {showStats && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Community Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">Members</span>
                      </div>
                      <Badge variant="secondary">
                        {defaultStats.memberCount?.toLocaleString()}+
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">Online Now</span>
                      </div>
                      <Badge variant="secondary">
                        {defaultStats.onlineCount}+
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">Avg Response</span>
                      </div>
                      <Badge variant="secondary">
                        {defaultStats.responseTime}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4"
              >
                <div className="border-t pt-6">
                  <h4 className="mb-4 font-semibold">Support Channels</h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    {supportChannels.map((channel) => (
                      <Card
                        key={channel.name}
                        className="transition-shadow hover:shadow-md"
                      >
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-full ${channel.color} flex items-center justify-center`}
                            >
                              <channel.icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h5 className="text-sm font-medium">
                                #{channel.name}
                              </h5>
                              <p className="text-muted-foreground text-xs">
                                {channel.title}
                              </p>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {channel.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="mb-4 font-semibold">Getting Started</h4>
                  <div className="text-muted-foreground space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                        1
                      </div>
                      <p>Join our Discord server using the link below</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                        2
                      </div>
                      <p>Introduce yourself in the #introductions channel</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                        3
                      </div>
                      <p>
                        Ask your question in the appropriate support channel
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                        4
                      </div>
                      <p>
                        Be patient and respectful - our community is here to
                        help!
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="flex-1 bg-[#5865F2] hover:bg-[#4752C4]"
                size="lg"
              >
                <Link
                  to="https://discord.gg/7uZ6PWf4Xv"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Discord className="mr-2 h-5 w-5" />
                  Join Discord Community
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show Less" : "Learn More"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
