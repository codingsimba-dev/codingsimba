import { data, redirect } from "react-router";
import { z } from "zod";
import type { Route } from "../../routes/resources/+types/subscribe";
import { checkHoneypot } from "~/utils/honeypot.server";
import { parseWithZod } from "@conform-to/zod";
import { SubscriptionSchema } from "~/components/email-subscription-form";
import { subscribeUser } from "~/utils/email.server";
import { StatusCodes } from "http-status-codes";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await checkHoneypot(formData);
  const submission = await parseWithZod(formData, {
    schema: SubscriptionSchema.transform(async (data, ctx) => {
      const { name, email } = data;
      console.log("Subscribing user:", { name, email });
      const response = await subscribeUser({ name, email });
      if (response.status !== "success") {
        ctx.addIssue({
          path: ["root"],
          code: z.ZodIssueCode.custom,
          message: "Invalid credentials.",
        });
        return z.NEVER;
      }
      return { response };
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return data(
      {
        result: { status: "error", ...submission.reply() },
        response: null,
      } as const,
      {
        status:
          submission.status === "error"
            ? StatusCodes.BAD_REQUEST
            : StatusCodes.OK,
      },
    );
  }

  if (!submission.value.response) {
    return data(
      {
        result: { status: "error", ...submission.reply() },
        response: null,
      } as const,
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      },
    );
  }

  return { result: null, response: submission.value.response };
}
