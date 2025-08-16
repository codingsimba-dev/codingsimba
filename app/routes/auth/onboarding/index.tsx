import type { Route } from "./+types/index";
import { z } from "zod";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { data, Form, redirect, useSearchParams } from "react-router";
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
import { requireAnonymous, sessionKey, signup } from "~/utils/auth.server";
import { authSessionStorage } from "~/utils/session.server";
import { verifySessionStorage } from "~/utils/verification.server";
import { safeRedirect } from "remix-utils/safe-redirect";
import {
  EmailSchema,
  NameSchema,
  PasswordSchema,
  RememberMeSchema,
} from "~/utils/user-validation";
import { useIsPending } from "~/utils/misc";
import { GradientContainer } from "~/components/gradient-container";
import { generateMetadata } from "~/utils/meta";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { checkHoneypot } from "~/utils/honeypot.server";
import { subscribeUser } from "~/utils/email.server";

export const onboardingSessionKey = "onboardingEmail";

const OnboardingSchema = z
  .object({
    name: NameSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    email: EmailSchema,
    redirectTo: z.string().optional(),
    rememberMe: RememberMeSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

async function requireOnboardingEmail(request: Request) {
  const verifySesison = await verifySessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const email = await verifySesison.get(onboardingSessionKey);

  if (typeof email !== "string" || !email) {
    throw redirect("/signup");
  }
  return email;
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnonymous(request);
  const email = await requireOnboardingEmail(request);
  return { email };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await checkHoneypot(formData);

  const submission = await parseWithZod(formData, {
    schema: OnboardingSchema.transform(async (data, ctx) => {
      const { name, password, email } = data;
      try {
        const session = await signup({
          email,
          name,
          password,
        });

        if (!session) {
          ctx.addIssue({
            path: ["root"],
            code: z.ZodIssueCode.custom,
            message: "Failed to create account. Please try again.",
          });
          return z.NEVER;
        }

        return { ...data, session };
      } catch (e) {
        console.error(e);
        ctx.addIssue({
          path: ["root"],
          code: z.ZodIssueCode.custom,
          message: "An unexpected error occurred. Please try again.",
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

  if (!submission.value.session) {
    return data({ status: "error", ...submission.reply() } as const, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  const { rememberMe, session, redirectTo, name, email } = submission.value;
  //Add user to newsletter
  void subscribeUser({ name, email });
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  authSession.set(sessionKey, session.id);

  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie"),
  );

  const headers = new Headers();
  headers.append(
    "set-cookie",
    await authSessionStorage.commitSession(authSession, {
      expires: rememberMe ? session.expirationDate : undefined,
    }),
  );

  headers.append(
    "set-cookie",
    await verifySessionStorage.destroySession(verifySession),
  );

  return redirect(safeRedirect(redirectTo), { headers });
}

export default function Onboarding({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Onboarding" });
  const isSubmitting = useIsPending();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const email = loaderData.email;

  const [form, fields] = useForm({
    id: "onboarding",
    lastResult: actionData,
    defaultValue: { redirectTo },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: OnboardingSchema });
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
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="bg-card/80 border-0 shadow-xl backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome aboard {email}</CardTitle>
              <CardDescription>Please enter your details</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...getFormProps(form)} method="post" className="space-y-4">
                <HoneypotInputs />
                <input
                  {...getInputProps(fields.redirectTo, { type: "hidden" })}
                  value={redirectTo ?? ""}
                />
                <input
                  {...getInputProps(fields.email, { type: "hidden" })}
                  value={email}
                />
                <div className="space-y-2">
                  <Label htmlFor={fields.name.id}>Name</Label>
                  <Input
                    {...getInputProps(fields.name, { type: "text" })}
                    placeholder="Tony Max"
                  />
                  <FormError errors={fields.name.errors} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={fields.password.id}>Password</Label>
                  <Input
                    {...getInputProps(fields.password, { type: "password" })}
                    placeholder="••••••"
                  />
                  <FormError errors={fields.password.errors} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={fields.confirmPassword.id}>
                    Confirm password
                  </Label>
                  <Input
                    {...getInputProps(fields.confirmPassword, {
                      type: "password",
                    })}
                    placeholder="••••••"
                  />
                  <FormError errors={fields.confirmPassword.errors} />
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
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  aria-label="Create account"
                >
                  Create account{" "}
                  {isSubmitting ? (
                    <LoaderCircle className="ml-2 animate-spin" />
                  ) : null}
                </Button>
                <FormError errors={form.allErrors.root || form.errors} />
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </GradientContainer>
    </>
  );
}
