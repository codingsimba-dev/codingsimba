import type { Route } from "./+types/signup";
import { z } from "zod";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { data, Form, Link, redirect, useSearchParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getInputProps, useForm } from "@conform-to/react";
import { getFormProps } from "@conform-to/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FormError } from "~/components/form-errors";
import { Button } from "~/components/ui/button";
import { parseWithZod } from "@conform-to/zod";
import { StatusCodes } from "http-status-codes";
import { FormConsent } from "~/components/form-consent";
import { onboardingSessionKey } from "./onboarding";
import { sendEmail } from "~/utils/email.server";
import { verifySessionStorage } from "~/utils/verification.server";
import { useIsPending } from "~/utils/misc";
import { ConnectionForm } from "~/components/connection-form";
import { requireAnonymous } from "~/utils/auth.server";
import { Verification } from "~/components/email-templates/verification";
import { EmailSchema } from "~/utils/user-validation";
import { prepareVerification } from "./verify.server";
import { GradientContainer } from "~/components/gradient-container";
import { prisma } from "~/utils/db.server";
import { generateMetadata } from "~/utils/meta";
import { checkHoneypot } from "~/utils/honeypot.server";
import { HoneypotInputs } from "remix-utils/honeypot/react";

const SignupSchema = z.object({
  email: EmailSchema,
  redirectTo: z.string().optional(),
  rememberMe: z.string().optional(),
});

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnonymous(request);
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await checkHoneypot(formData);
  const submission = await parseWithZod(formData, {
    schema: SignupSchema.superRefine(async (data, ctx) => {
      const user = await prisma.user.findFirst({
        where: { email: data.email },
        select: { id: true },
      });
      if (user) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "Email already in use.",
        });
        return z.NEVER;
      }
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

  const { email } = submission.value;
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie"),
  );

  verifySession.set(onboardingSessionKey, email);
  const { verifyUrl, redirectTo, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    type: "onboarding",
    target: email,
  });

  const response = await sendEmail({
    to: email,
    subject: `Welcome to Coding Simba!`,
    react: <Verification code={otp} verificationUrl={verifyUrl.toString()} />,
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

export default function Signup({ actionData }: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Signup | Coding Simba" });
  const isSubmitting = useIsPending();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirectTo");

  const [form, fields] = useForm({
    id: "signup",
    lastResult: actionData,
    defaultValue: { redirectTo },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignupSchema });
    },
    shouldValidate: "onBlur",
  });

  return (
    <>
      {metadata}
      <GradientContainer>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="bg-card/80 border-0 shadow-xl backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Let&apos;s Begin!</CardTitle>
              <CardDescription>Enter your email to continue</CardDescription>
            </CardHeader>

            <CardContent className="my-8 space-y-6">
              <Form {...getFormProps(form)} method="post" className="space-y-4">
                <HoneypotInputs />
                <input
                  {...getInputProps(fields.redirectTo, { type: "hidden" })}
                  value={redirectTo ?? ""}
                />
                <div className="space-y-2">
                  <Label htmlFor={fields.email.id}>Email</Label>
                  <Input
                    {...getInputProps(fields.email, { type: "email" })}
                    placeholder="hello@example.com"
                  />
                  <FormError errors={fields.email.errors} />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  aria-label="Signup"
                >
                  Submit{" "}
                  {isSubmitting ? (
                    <LoaderCircle className="ml-2 animate-spin" />
                  ) : null}
                </Button>
                <FormError errors={form.allErrors.root || form.errors} />
              </Form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="border-border w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background text-muted-foreground rounded-md px-2">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="w-full">
                <ConnectionForm
                  redirectTo={redirectTo}
                  providerName="github"
                  type="Signup"
                />
              </div>

              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/signin"
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Signin
                  </Link>
                </p>
              </div>
              <FormConsent type="signup" />
            </CardContent>
          </Card>
        </motion.div>
      </GradientContainer>
    </>
  );
}
