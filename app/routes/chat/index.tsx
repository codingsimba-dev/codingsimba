import type { Route } from "./+types/index";
import { ArrowDownAZ } from "lucide-react";
import { EmptyState } from "~/components/empty-state";
import { Header } from "~/components/page-header";
import json2md from "json2md";
import { redirect } from "react-router";
import { askQuestion } from "~/utils/openai.server";
import { StatusCodes } from "http-status-codes";
import { bundleMDX } from "~/utils/mdx.server";
import { checkHoneypot } from "~/utils/honeypot.server";
import { z } from "zod";
import { requireUserId } from "~/utils/auth.server";
import {
  getOrCreateConversation,
  addUserMessage,
  addAssistantMessage,
} from "~/utils/conversation.server";

type Response = {
  answer: string | null;
  error: string | null;
};

export const ChatSchema = z.object({
  documentId: z.string(),
  question: z
    .string({ message: "Ask a question to get started" })
    .min(5, { message: "Ask a more specific question" })
    .max(1000, { message: "Question is too long" }),
});

export const loader = () => redirect("/");

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await checkHoneypot(formData);
  const userId = await requireUserId(request);
  const response = ChatSchema.safeParse(Object.fromEntries(formData));
  if (!response.success) {
    return {
      answer: null,
      error: Object.values(response.error.flatten().fieldErrors)
        .flat()
        .join(", "),
    } as Response;
  }

  const { documentId, question } = response.data;

  try {
    // Get or create conversation for this user and document
    const conversation = await getOrCreateConversation({
      userId,
      documentId,
      title: `Chat about ${documentId || "general topics"}`,
    });

    // Add user message to conversation
    await addUserMessage({
      userId,
      conversationId: conversation.id,
      documentId,
      content: question,
    });

    // Get AI response
    const aiResponse = await askQuestion({
      question,
      documentId,
    });
    if (!aiResponse.answer) {
      return {
        answer: null,
        error: "An error occurred, please try again",
      } as Response;
    }

    // Add assistant message to conversation
    await addAssistantMessage({
      userId,
      conversationId: conversation.id,
      documentId,
      content: aiResponse.answer,
    });

    // Convert to MDX and return
    const md = json2md(aiResponse.answer);
    const { code } = await bundleMDX({ source: md });
    return { answer: code, error: null } as Response;
  } catch (error) {
    if (
      error instanceof Response &&
      error.status === StatusCodes.TOO_MANY_REQUESTS
    ) {
      return {
        answer: null,
        error:
          "We're experiencing high traffic. Please wait a moment and try again, or contact support if this persists.",
      } as Response;
    }

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        return {
          answer: null,
          error: "Network error, please check your connection",
        } as Response;
      }

      if (error.message.includes("timeout")) {
        return {
          answer: null,
          error: "Request timed out, please try again",
        } as Response;
      }
    }
    console.error(error);

    return { answer: null, error: "Internal server error" } as Response;
  }
}

export default function ChatRoute() {
  return (
    <div>
      <Header title="Chat" description="TekBreed Chat." />
      <div className="container mx-auto my-20 w-full max-w-3xl">
        <EmptyState
          icon={<ArrowDownAZ className="size-8" />}
          title="Chat Coming Soon!"
          description="We're currently developing chat. While you wait, feel free to explore our articles and tutorials."
        />
      </div>
    </div>
  );
}
