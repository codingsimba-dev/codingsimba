import type { Route } from "./+types/chatbot";
import json2md from "json2md";
import { redirect } from "react-router";
import { askQuestion } from "~/utils/openai.server";
import { StatusCodes } from "http-status-codes";
import { bundleMDX } from "~/utils/mdx.server";
import { checkHoneypot } from "~/utils/honeypot.server";
import { parseWithZod } from "@conform-to/zod";
import { ChatSchema } from "~/components/chatbot";
// import { requireUserId } from "~/utils/auth.server";

export const loader = () => redirect("/");

export async function action({ request }: Route.ActionArgs) {
  // const userId = await requireUserId(request);
  const formData = await request.formData();
  await checkHoneypot(formData);
  const submission = parseWithZod(formData, { schema: ChatSchema });
  if (submission.status !== "success") {
    return {
      answer: null,
      error: submission.reply().fields,
    } as const;
  }
  const { documentId, question, previousAnswer } = submission.value;

  try {
    const response = await askQuestion({
      question,
      documentId,
      previousAnswer,
    });
    if (!response.answer) {
      return {
        answer: null,
        error: "An error occurred, please try again",
      } as const;
    }

    // TODO: Track user usage
    // console.log(response.sources);
    const md = json2md(response.answer);
    const { code } = await bundleMDX({ source: md });
    return { answer: code, error: null } as const;
  } catch (error) {
    if (
      error instanceof Response &&
      error.status === StatusCodes.TOO_MANY_REQUESTS
    ) {
      return {
        answer: null,
        error:
          "We're experiencing high traffic. Please wait a moment and try again, or contact support if this persists.",
      } as const;
    }

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        return {
          answer: null,
          error: "Network error, please check your connection",
        } as const;
      }

      if (error.message.includes("timeout")) {
        return {
          answer: null,
          error: "Request timed out, please try again",
        } as const;
      }
    }

    return { answer: null, error: "Internal server error" } as const;
  }
}
