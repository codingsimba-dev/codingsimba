import type { Route } from "./+types/rag";
import { z } from "zod";
import { redirect } from "react-router";
import { askQuestion } from "~/utils/openai.server";
import { invariant } from "~/utils/misc";
import { StatusCodes } from "http-status-codes";
// import { requireUserId } from "~/utils/auth.server";

const ChatSchema = z.object({
  documentId: z.string().optional(),
  question: z.string(),
});

export const loader = () => redirect("/");

export async function action({ request }: Route.ActionArgs) {
  try {
    // const userId = await requireUserId(request);
    const formData = await request.formData();
    const { documentId, question } = ChatSchema.parse(
      Object.fromEntries(formData),
    );

    invariant(question.trim(), "Question is required");
    if (question.length > 1000) {
      return new Response("Question is too long", {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await askQuestion({ question, documentId });
          const encoder = new TextEncoder();
          if (typeof response.answer === "string") {
            controller.enqueue(encoder.encode(response.answer));
          } else {
            for await (const chunk of response.answer) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("RAG error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
