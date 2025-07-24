import type { Route } from "./+types/forgot-password";
import type { SEOHandle } from "@nasa-gcn/remix-seo";
import { z } from "zod";
import { motion } from "framer-motion";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { data, Form, redirect, Link } from "react-router";
import { FormError } from "~/components/form-errors";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { GradientContainer } from "~/components/gradient-container";
import { useIsPending } from "~/utils/misc";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { prisma } from "~/utils/db.server";
import { prepareVerification } from "./verify.server";
import { sendEmail } from "~/utils/email.server";
import { checkHoneypot } from "~/utils/honeypot.server";
import { StatusCodes } from "http-status-codes";
import { Verification } from "~/components/email-templates/verification";
import { EmailSchema } from "~/utils/user-validation";
import { generateMetadata } from "~/utils/meta";
import { HoneypotInputs } from "remix-utils/honeypot/react";

const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export const resetPasswordEmailSessionKey = "resetPasswordEmailKey";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await checkHoneypot(formData);
  const submission = await parseWithZod(formData, {
    schema: ForgotPasswordSchema.superRefine(async (data, ctx) => {
      const user = await prisma.user.findFirst({
        where: { email: data.email },
        select: { id: true },
      });
      if (!user) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "No user exists with this email",
        });
        return z.NEVER;
      }
      return data;
    }),
    async: true,
  });
  if (submission.status !== "success") {
    return data(
      { ...submission.reply() },
      {
        status:
          submission.status === "error"
            ? StatusCodes.BAD_REQUEST
            : StatusCodes.OK,
      },
    );
  }
  const { email } = submission.value;
  const user = await prisma.user.findFirstOrThrow({
    where: { email },
    select: { email: true },
  });

  const { verifyUrl, redirectTo, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    type: "reset_password",
    target: email,
  });

  const response = await sendEmail({
    to: user.email,
    subject: `Coding Simba Password Reset`,
    react: <Verification verificationUrl={verifyUrl.toString()} code={otp} />,
  });

  if (response.status === "success") {
    return redirect(redirectTo.toString());
  } else {
    return data(
      { ...submission.reply({ formErrors: [response.error] }) },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
};

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Forgot Password" });

  const isSubmitting = useIsPending();
  const [form, fields] = useForm({
    id: "forgot-password",
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ForgotPasswordSchema });
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
          className="mx-auto w-full max-w-md"
        >
          <Card className="bg-card/80 w-full shadow-xl backdrop-blur-sm">
            <Form
              {...getFormProps(form)}
              method="post"
              className="mx-auto w-full space-y-6"
            >
              <HoneypotInputs />
              <CardHeader>
                <CardTitle>Forgot password</CardTitle>
                <CardDescription>
                  Enter your email, and we’ll send you a secure link to reset
                  your password.
                </CardDescription>
              </CardHeader>
              <CardContent className="my-8">
                <div className="space-y-2">
                  <Label htmlFor={fields.email.id}>Email</Label>
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
                      <Link to={"/signin"}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      Recover password
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
