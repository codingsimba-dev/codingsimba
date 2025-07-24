import type { Route } from "./+types/reset-password";
import { motion } from "framer-motion";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { prisma } from "~/utils/db.server";
import { getPasswordHash, requireAnonymous } from "../../utils/auth.server";
import { data, Form, Link, redirect } from "react-router";
import { FormError } from "~/components/form-errors";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { StatusCodes } from "http-status-codes";
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
import { verifySessionStorage } from "~/utils/verification.server";
import { resetPasswordEmailSessionKey } from "./forgot-password";
import { PasswordAndConfirmPasswordSchema } from "~/utils/user-validation";
import { generateMetadata } from "~/utils/meta";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { checkHoneypot } from "~/utils/honeypot.server";

const ResetPasswordSchema = PasswordAndConfirmPasswordSchema;

async function requireResetPasswordEmail(request: Request) {
  await requireAnonymous(request);
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const resetPasswordEmail = verifySession.get(resetPasswordEmailSessionKey);
  if (typeof resetPasswordEmail !== "string" || !resetPasswordEmail) {
    throw redirect("/signin");
  }
  return resetPasswordEmail;
}

export async function loader({ request }: Route.LoaderArgs) {
  const resetPasswordEmail = await requireResetPasswordEmail(request);
  return { resetPasswordEmail };
}

export async function action({ request }: Route.ActionArgs) {
  const userEmail = await requireResetPasswordEmail(request);
  const formData = await request.formData();
  await checkHoneypot(formData);
  const submission = parseWithZod(formData, {
    schema: ResetPasswordSchema,
  });
  if (submission.status !== "success") {
    return data({ status: "error", ...submission.reply() } as const, {
      status:
        submission.status === "error"
          ? StatusCodes.BAD_REQUEST
          : StatusCodes.OK,
    });
  }

  const { password } = submission.value;
  const update = await prisma.user.update({
    where: { email: userEmail },
    select: { id: true },
    data: {
      password: {
        update: {
          hash: await getPasswordHash(password),
        },
      },
    },
  });
  if (!update) {
    return data({ status: "error", ...submission.reply() } as const, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
  const verifySession = await verifySessionStorage.getSession();
  throw redirect("/signin", {
    headers: {
      "set-cookie": await verifySessionStorage.destroySession(verifySession),
    },
  });
}

export default function ResetPasswordRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Reset Password" });
  const isUpdating = useIsPending();
  const [form, fields] = useForm({
    id: "reset-password",
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ResetPasswordSchema });
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
                <CardTitle>Password reset</CardTitle>
                <CardDescription>
                  Reset your password {loaderData.resetPasswordEmail}
                </CardDescription>
              </CardHeader>
              <CardContent className="my-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor={fields.password.id}>New Password</Label>
                  <Input
                    {...getInputProps(fields.password, { type: "password" })}
                    placeholder="••••••"
                    className="border-border bg-background h-12 text-lg"
                  />
                  <FormError errors={fields.password.errors} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={fields.confirmPassword.id}>
                    Confirm new password
                  </Label>
                  <Input
                    {...getInputProps(fields.confirmPassword, {
                      type: "password",
                    })}
                    placeholder="••••••"
                    className="border-border bg-background h-12 text-lg"
                  />
                  <FormError errors={fields.confirmPassword.errors} />
                </div>
                <FormError errors={form.errors} />
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-end">
                  <div className="flex gap-4">
                    <Link to={"/forgot-password"}>
                      <Button
                        type="button"
                        variant={"outline"}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={isUpdating}>
                      Update{" "}
                      {isUpdating ? (
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
