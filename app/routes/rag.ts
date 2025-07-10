import type { Route } from "./+types/rag";
import json2md from "json2md";
import { z } from "zod";
import { data, redirect } from "react-router";
import { askQuestion } from "~/utils/openai.server";
import { invariant } from "~/utils/misc";
import { StatusCodes } from "http-status-codes";
import { bundleMDX } from "~/utils/mdx.server";
// import { requireUserId } from "~/utils/auth.server";

const ChatSchema = z.object({
  documentId: z.string().optional(),
  question: z.string(),
  previousAnswer: z.string().optional(),
});

export const loader = () => redirect("/");

export async function action({ request }: Route.ActionArgs) {
  // const userId = await requireUserId(request);
  const formData = await request.formData();
  const { documentId, question, previousAnswer } = ChatSchema.parse(
    Object.fromEntries(formData),
  );

  try {
    invariant(question.trim(), "Question is required");
    if (question.length > 1000) {
      return data(
        { error: "Question is too long" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const response = await askQuestion({
      question,
      documentId,
      previousAnswer,
    });
    if (!response.answer) {
      return data(
        { error: "No answer found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    // TODO: Track user usage
    // console.log(response.sources);
    const md = json2md(response.answer);
    const { code } = await bundleMDX({ source: md });
    return data({ answer: code }, { status: StatusCodes.OK });
  } catch (error) {
    if (
      error instanceof Response &&
      error.status === StatusCodes.TOO_MANY_REQUESTS
    ) {
      return data(
        { error: "Too many requests, please try again later" },
        { status: StatusCodes.TOO_MANY_REQUESTS },
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        return data(
          { error: "Network error, please check your connection" },
          { status: StatusCodes.SERVICE_UNAVAILABLE },
        );
      }

      if (error.message.includes("timeout")) {
        return data(
          { error: "Request timed out, please try again" },
          { status: StatusCodes.REQUEST_TIMEOUT },
        );
      }
    }

    return data(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
