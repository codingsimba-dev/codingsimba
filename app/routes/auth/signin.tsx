import type { Route } from "./+types/signin";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { data, Form, Link, useSearchParams } from "react-router";
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
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { FormConsent } from "~/components/form-consent";
import { ConnectionForm } from "~/components/connection-form";
import { handleNewSession } from "~/utils/session.server";
import { requireAnonymous, signin } from "../../utils/auth.server";
import { EmailSchema, PasswordSchema } from "~/utils/user-validation";
import { useIsPending } from "~/utils/misc";
import { GradientContainer } from "~/components/gradient-container";
import { generateMetadata } from "~/utils/meta";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { checkHoneypot } from "~/utils/honeypot.server";

const SigninSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  redirectTo: z.string().optional(),
  rememberMe: z
    .boolean()
    .optional()
    .transform((val) => (val ? "true" : undefined)),
});

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnonymous(request);
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await checkHoneypot(formData);

  const submission = await parseWithZod(formData, {
    schema: SigninSchema.transform(async (data, ctx) => {
      const { email, password } = data;
      const session = await signin({ email, password });
      if (!session) {
        ctx.addIssue({
          path: ["root"],
          code: z.ZodIssueCode.custom,
          message: "Invalid credentials.",
        });
        return z.NEVER;
      }
      return { ...data, session };
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

  if (!submission.value.session) {
    return data({ status: "error", ...submission.reply() } as const, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  const { rememberMe, redirectTo, session } = submission.value;
  console.log(redirectTo);

  return await handleNewSession({
    request,
    session,
    redirectTo,
    rememberMe,
  });
}

export default function Signin({ actionData }: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Signin | Coding Simba" });
  const isSubmitting = useIsPending();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  console.log(redirectTo);

  const [form, fields] = useForm({
    id: "signin",
    lastResult: actionData,
    defaultValue: { redirectTo },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SigninSchema });
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
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Please enter your credentials</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
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
                    placeholder="hello@tonymax.com"
                  />
                  <FormError errors={fields.email.errors} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={fields.password.id}>Password</Label>
                  <Input
                    {...getInputProps(fields.password, { type: "password" })}
                    placeholder="••••••"
                  />
                  <FormError errors={fields.password.errors} />
                </div>
                <div className="flex justify-between">
                  <Label
                    htmlFor={fields.rememberMe.id}
                    className="text-muted-foreground flex items-center gap-2 text-sm"
                  >
                    <input
                      {...getInputProps(fields.rememberMe, {
                        type: "checkbox",
                      })}
                      className="border-border text-primary focus:ring-primary h-4 w-4 rounded"
                    />
                    Remember Me
                  </Label>

                  <Link
                    to={"/forgot-password"}
                    className="text-sm text-blue-700 dark:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  aria-label="Sign in"
                >
                  Sign In
                  {isSubmitting ? (
                    <LoaderCircle className="ml-2 animate-spin" />
                  ) : null}
                </Button>
                <FormError
                  errors={form.allErrors.root || form.errors}
                  className="-mt-3"
                />
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
                  type="Signin"
                />
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    to={`/signup${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Signup
                  </Link>
                </p>
              </div>
              <FormConsent type="signin" />
            </CardContent>
          </Card>
        </motion.div>
      </GradientContainer>
    </>
  );
}
