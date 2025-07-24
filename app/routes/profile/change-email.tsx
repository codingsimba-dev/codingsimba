import type { Route } from "./+types/change-email";
import { z } from "zod";
import { motion } from "framer-motion";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { requireUserId } from "../../utils/auth.server";
import { data, Form, Link, redirect } from "react-router";
import { FormError } from "~/components/form-errors";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { GradientContainer } from "~/components/gradient-container";
import { StatusCodes } from "http-status-codes";
import { verifySessionStorage } from "~/utils/verification.server";
import { prisma } from "~/utils/db.server";
import { prepareVerification } from "../auth/verify.server";
import { sendEmail } from "~/utils/email.server";
import { Verification } from "~/components/email-templates/verification";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useIsPending } from "~/utils/misc";
import { EmailSchema } from "~/utils/user-validation";
import { generateMetadata } from "~/utils/meta";
import { checkHoneypot } from "~/utils/honeypot.server";
import { HoneypotInputs } from "remix-utils/honeypot/react";

const ChangeEmailSchema = z.object({
  email: EmailSchema,
});

export const newEmailAddressSessionKey = "new-email-address";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) {
    const params = new URLSearchParams({ redirectTo: request.url });
    throw redirect(`/signin?${params}`);
  }
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  await checkHoneypot(formData);
  const submission = await parseWithZod(formData, {
    schema: ChangeEmailSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
        select: { email: true },
      });
      if (existingUser) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "This email is already in use.",
        });
        return z.NEVER;
      }
      return data;
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return data({ status: "error", ...submission.reply() } as const, {
      status:
        submission.status === "error"
          ? StatusCodes.BAD_REQUEST
          : StatusCodes.OK,
    });
  }
  const { otp, redirectTo, verifyUrl } = await prepareVerification({
    period: 10 * 60,
    request,
    target: userId,
    type: "change_email",
  });

  const { email } = submission.value;

  const response = await sendEmail({
    to: email,
    subject: `Coding Simba Email Change Verification`,
    react: <Verification verificationUrl={verifyUrl.toString()} code={otp} />,
  });

  if (response.status === "success") {
    const verifySession = await verifySessionStorage.getSession();
    verifySession.set(newEmailAddressSessionKey, email);
    return redirect(redirectTo.toString(), {
      headers: {
        "set-cookie": await verifySessionStorage.commitSession(verifySession),
      },
    });
  } else {
    return data(
      {
        ...submission.reply(),
        formErrors: [response.error],
      } as const,
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export default function ChangeEmail({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Change Email" });
  const user = loaderData.user;
  const isSubmitting = useIsPending();

  const [form, fields] = useForm({
    id: "change-email",
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ChangeEmailSchema });
    },
    shouldValidate: "onBlur",
  });

  return (
    <>
      {metadata}
      <GradientContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto w-full max-w-lg"
        >
          <Card className="bg-card/80 w-full shadow-xl backdrop-blur-sm">
            <Form
              {...getFormProps(form)}
              method="post"
              className="mx-auto w-full space-y-6"
            >
              <HoneypotInputs />
              <CardHeader>
                <CardTitle>
                  A confirmation email will be sent to your{" "}
                  <strong>new email address</strong>.
                </CardTitle>
                <CardDescription>
                  A security notification will also be sent to your current
                  email: <strong className="font-bold">{user.email}</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="my-8">
                <div className="space-y-2">
                  <Label htmlFor={fields.email.id}>New Email</Label>
                  <Input
                    {...getInputProps(fields.email, { type: "email" })}
                    placeholder="johndoe@example.com"
                    className="border-border bg-background h-12 !text-lg"
                  />
                  <FormError errors={fields.email.errors} />
                </div>
                <FormError errors={form.errors} />
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-end">
                  <div className="flex gap-6">
                    <Button variant={"outline"} asChild>
                      <Link to={"/profile"}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      Send confirmation{" "}
                      {isSubmitting ? (
                        <Loader2 className="ml-2 animate-spin" />
                      ) : null}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Form>
          </Card>
        </motion.div>
      </GradientContainer>
    </>
  );
}
