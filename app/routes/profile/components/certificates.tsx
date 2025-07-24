import React from "react";
import { motion } from "framer-motion";
// import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/empty-state";
import { ArrowDownAZ } from "lucide-react";
import { Container } from "./container";

export function Certificates() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=200&width=200&text=JD",
    bio: "Frontend developer passionate about React and modern JavaScript.",
    location: "San Francisco, CA",
    joinDate: "January 2023",
    courses: [
      {
        id: "modern-react",
        title: "Modern React Development",
        progress: 75,
        lastAccessed: "2 days ago",
        image: "/placeholder.svg?height=80&width=120&text=React",
      },
      {
        id: "advanced-typescript",
        title: "Advanced TypeScript",
        progress: 45,
        lastAccessed: "1 week ago",
        image: "/placeholder.svg?height=80&width=120&text=TypeScript",
      },
      {
        id: "fullstack-nextjs",
        title: "Full-Stack Next.js",
        progress: 10,
        lastAccessed: "3 days ago",
        image: "/placeholder.svg?height=80&width=120&text=Next.js",
      },
    ],
    certificates: [
      {
        id: "react-fundamentals",
        title: "React Fundamentals",
        issueDate: "March 15, 2023",
        image: "/placeholder.svg?height=80&width=120&text=Certificate",
      },
      {
        id: "javascript-advanced",
        title: "Advanced JavaScript",
        issueDate: "February 10, 2023",
        image: "/placeholder.svg?height=80&width=120&text=Certificate",
      },
    ],
    subscription: {
      plan: "Pro",
      status: "Active",
      renewDate: "January 15, 2024",
      price: "$19.99/month",
    },
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container title="My Certificates">
        <EmptyState
          icon={<ArrowDownAZ className="size-8" />}
          title="Not Implemented!"
          description="We are working to implement this feature."
        />
        {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {user.certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="overflow-hidden rounded-lg border border-border"
              >
                <div className="relative aspect-video">
                  <img
                    src={certificate.image || "/placeholder.svg"}
                    alt={certificate.title}
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-bold">{certificate.title}</h3>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Issued on {certificate.issueDate}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div> */}
      </Container>
    </motion.div>
  );
}
