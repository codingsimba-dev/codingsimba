import React from "react";
import type { Route } from "./+types/tutorial";
import { Outlet, Link, useLocation } from "react-router";
import { getTutorialDetails } from "~/utils/content.server/turorials/utils";
import { invariant, invariantResponse } from "~/utils/misc";
import { StatusCodes } from "http-status-codes";
import { DetailsHeader } from "~/components/details-header";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import {
  CheckCircle,
  Circle,
  Play,
  Crown,
  BookOpen,
  Clock,
  Target,
  ArrowRight,
} from "lucide-react";
import { cn } from "~/utils/misc";
import type { Tutorial } from "~/utils/content.server/turorials/types";

export async function loader({ params }: Route.LoaderArgs) {
  const { tutorialId } = params;
  invariant(tutorialId, "tutorialId is required");
  const tutorial = await getTutorialDetails(tutorialId);
  invariantResponse(tutorial, `Tutorial with id ${tutorialId} not found`, {
    status: StatusCodes.NOT_FOUND,
  });
  console.log("tutorial", tutorial);

  return { tutorial };
}

export default function TutorialRoute({ loaderData }: Route.ComponentProps) {
  const { tutorial } = loaderData;
  const location = useLocation();
  const currentLessonId = location.pathname.split("/").pop();
  const isOverview = !currentLessonId || currentLessonId === tutorial.id;

  return (
    <>
      <DetailsHeader item={tutorial} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Lessons
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {tutorial.lessonsCount} lessons
                    </Badge>
                    {tutorial.premium && (
                      <Badge className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Crown className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>

                <nav className="space-y-2">
                  {tutorial.lessons.map((lesson, index) => {
                    const isActive = lesson.id === currentLessonId;
                    const isCompleted = false; // TODO: Implement progress tracking

                    return (
                      <Link
                        key={lesson.id}
                        to={`/tutorials/${tutorial.id}/lessons/${lesson.id}`}
                        className="block"
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3 px-3 py-2 text-left",
                            isActive &&
                              "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium">
                              Lesson {index + 1}
                            </span>
                          </div>
                          {isActive && <Play className="h-3 w-3" />}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>

                {/* Tutorial Info */}
                <div className="mt-8 border-t pt-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Category
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tutorial.category.title}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Author
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tutorial.author.name}
                      </p>
                    </div>
                    {tutorial.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Tags
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {tutorial.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {isOverview ? <TutorialOverview tutorial={tutorial} /> : <Outlet />}
          </main>
        </div>
      </div>
    </>
  );
}

function TutorialOverview({ tutorial }: { tutorial: Tutorial }) {
  return (
    <div className="space-y-8">
      {/* Tutorial Overview */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to {tutorial.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Get started with this comprehensive tutorial series designed to help
            you master the fundamentals.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lessons
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {tutorial.lessonsCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Duration
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ~2 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Level
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Beginner
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What You&apos;ll Learn */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              What You&apos;ll Learn
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Core concepts and fundamentals
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Practical hands-on exercises
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Real-world project examples
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Best practices and tips
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Prerequisites
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Circle className="mt-0.5 h-5 w-5 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Basic understanding of programming concepts
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Circle className="mt-0.5 h-5 w-5 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Familiarity with web development basics
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Circle className="mt-0.5 h-5 w-5 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  A computer with internet access
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Tutorial */}
        <div className="flex justify-center">
          <Link
            to={`/tutorials/${tutorial.id}/lessons/${tutorial.lessons[0].id}`}
          >
            <Button size="lg" className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Start Tutorial
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
