/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import type { Route } from "./+types/lesson";
import { Link, useLocation, useParams } from "react-router";
import { invariant, invariantResponse } from "~/utils/misc";
import { StatusCodes } from "http-status-codes";
import {
  getTutorialLessonDetails,
  getTutorialDetails,
} from "~/utils/content.server/turorials/utils";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Code,
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
} from "lucide-react";
import { cn } from "~/utils/misc";

export async function loader({ params }: Route.LoaderArgs) {
  const { lessonId, tutorialId } = params;
  invariant(lessonId, "lessonId is required");
  invariant(tutorialId, "tutorialId is required");

  const [lesson, tutorial] = await Promise.all([
    getTutorialLessonDetails(lessonId),
    getTutorialDetails(tutorialId),
  ]);

  invariantResponse(lesson, `Lesson with id ${lessonId} not found`, {
    status: StatusCodes.NOT_FOUND,
  });

  invariantResponse(tutorial, `Tutorial with id ${tutorialId} not found`, {
    status: StatusCodes.NOT_FOUND,
  });

  return { lesson, tutorial };
}

export default function TutorialLessonRoute({
  loaderData,
}: Route.ComponentProps) {
  const { lesson, tutorial } = loaderData;
  const location = useLocation();
  const params = useParams();

  // Find current lesson index and navigation
  const currentLessonIndex = tutorial.lessons.findIndex(
    (l) => l.id === lesson.id,
  );
  const currentLesson = tutorial.lessons[currentLessonIndex];
  const previousLesson = tutorial.lessons[currentLessonIndex - 1];
  const nextLesson = tutorial.lessons[currentLessonIndex + 1];

  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === tutorial.lessons.length - 1;

  return (
    <div className="space-y-8">
      {/* Lesson Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link
            to="/tutorials"
            className="hover:text-gray-900 dark:hover:text-gray-100"
          >
            Tutorials
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            to={`/tutorials/${tutorial.id}`}
            className="hover:text-gray-900 dark:hover:text-gray-100"
          >
            {tutorial.title}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-gray-100">
            Lesson {currentLessonIndex + 1}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {lesson.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {lesson.content.substring(0, 150)}...
          </p>
        </div>

        {/* Lesson Meta */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>~15 min read</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Target className="h-4 w-4" />
            <span>Beginner</span>
          </div>
          {tutorial.premium && (
            <Badge className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <BookOpen className="h-3 w-3" />
              Premium Content
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Lesson Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lesson Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {lesson.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          {lesson.sandpackTemplates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Interactive Code Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lesson.sandpackTemplates.map((template, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900"
                    >
                      {/* <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                        {template.name || `Example ${index + 1}`}
                      </h4> */}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.description || "Interactive code example"}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() => {
                          // TODO: Open code editor
                          console.log("Open code editor for:", template);
                        }}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Run Code
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* React Components */}
          {lesson.reactComponents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  React Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lesson.reactComponents.map((component, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900"
                    >
                      {/* <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                        {component.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {component.description}
                      </p> */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tutorial Progress
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(
                      ((currentLessonIndex + 1) / tutorial.lessonsCount) * 100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${((currentLessonIndex + 1) / tutorial.lessonsCount) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLessonIndex + 1} of {tutorial.lessonsCount} lessons
                  completed
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Mark lesson as completed
                  console.log("Mark lesson as completed");
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Add to favorites
                  console.log("Add to favorites");
                }}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Add to Favorites
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isFirstLesson && previousLesson && (
            <Link to={`/tutorials/${tutorial.id}/lessons/${previousLesson.id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Previous Lesson
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isLastLesson && nextLesson && (
            <Link to={`/tutorials/${tutorial.id}/lessons/${nextLesson.id}`}>
              <Button className="flex items-center gap-2">
                Next Lesson
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {isLastLesson && (
            <Button className="flex items-center gap-2">
              Complete Tutorial
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
