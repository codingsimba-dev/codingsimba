import React from "react";
import { CheckCircle } from "lucide-react";
import { getImgSrc } from "~/utils/misc";

export function Mission() {
  return (
    <section>
      <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
        <div className="text-lg text-gray-800 dark:text-gray-300">
          <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
          <p className="mb-6">
            We believe that programming knowledge should be accessible to
            everyone, from individual learners to entire organizations. Our goal
            is to break down complex concepts into understandable pieces that
            anyone can learn, regardless of their background or experience
            level.
          </p>
          <p className="mb-6">
            Through our courses, tutorials, articles, and structured programs,
            we&apos;ve helped thousands of developers improve their skills and
            build amazing projects. We focus on practical, real-world
            applications so you can apply what you learn immediately in your own
            work or team environment.
          </p>
          <div className="space-y-4">
            <ListItem>
              Making complex concepts accessible to learners of all levels
            </ListItem>
            <ListItem>
              Creating high-quality, up-to-date educational content for
              individuals and teams
            </ListItem>
            <ListItem>
              Building structured learning programs for organizational growth
            </ListItem>
            <ListItem>
              Empowering students and teams to build real-world projects
            </ListItem>
            <ListItem>
              Providing scalable learning solutions for growing organizations
            </ListItem>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-white blur-3xl dark:to-gray-950" />
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
              <img
                src={getImgSrc({ fileKey: "tekbreedlogo.png" })}
                alt="TekBreed"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rotate-6 transform rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-2 h-4 w-3/4 rounded bg-blue-600 dark:bg-blue-500" />
              <div className="mb-2 h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start">
      <CheckCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
      <p className="text-gray-800 dark:text-gray-300">{children}</p>
    </div>
  );
}
