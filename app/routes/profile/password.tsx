import type { Route } from "./+types/password";
import { z } from "zod";
import { motion } from "framer-motion";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { prisma } from "~/utils/db.server";
import {
  getPasswordHash,
  requireUser,
  verifyUserPassword,
} from "../../utils/auth.server";
import { data, Form, Link } from "react-router";
import { FormError } from "~/components/form-errors";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { StatusCodes } from "http-status-codes";
import { redirectWithToast } from "~/utils/toast.server";
import { GradientContainer } from "~/components/gradient-container";
import { useIsPending } from "~/utils/misc";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { PasswordSchema } from "~/utils/user-validation";
import { generateMetadata } from "~/utils/meta";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { checkHoneypot } from "~/utils/honeypot.server";

export const UpdatePasswordSchema = z
  .object({
    currentPassword: PasswordSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "The passwords must match",
      });
    }
  });

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  await checkHoneypot(formData);
  const submission = await parseWithZod(formData, {
    schema: UpdatePasswordSchema.superRefine(async (data, ctx) => {
      const isValid = await verifyUserPassword(
        { email: user.email },
        data.currentPassword,
      );
      if (!isValid) {
        ctx.addIssue({
          path: ["currentPassword"],
          code: z.ZodIssueCode.custom,
          message: "Incorrect current password.",
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

  const { password } = submission.value;
  const update = await prisma.password.update({
    where: { userId: user.id },
    select: { userId: true },
    data: {
      hash: await getPasswordHash(password),
    },
  });

  if (!update) {
    return data({ status: "error", ...submission.reply() } as const, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
  throw await redirectWithToast("/profile", {
    title: "Password updated",
    description: "You have successfully updated your password",
    type: "success",
  });
}

export default function ResetPasswordRoute({
  actionData,
}: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Update Password" });

  const isUpdating = useIsPending();
  const [form, fields] = useForm({
    id: "update-password",
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UpdatePasswordSchema });
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
            <Form {...getFormProps(form)} method="post">
              <HoneypotInputs />
              <CardHeader>
                <CardTitle>Update your password</CardTitle>
              </CardHeader>
              <CardContent className="my-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor={fields.currentPassword.id}>
                    Current password
                  </Label>
                  <Input
                    {...getInputProps(fields.currentPassword, {
                      type: "password",
                    })}
                    placeholder="••••••"
                    className="border-border bg-background h-12 !text-lg"
                  />
                  <FormError errors={fields.currentPassword.errors} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={fields.password.id}>New Password</Label>
                  <Input
                    {...getInputProps(fields.password, { type: "password" })}
                    placeholder="••••••"
                    className="border-border bg-background h-12 !text-lg"
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
                    className="border-border bg-background h-12 !text-lg"
                  />
                  <FormError errors={fields.confirmPassword.errors} />
                </div>
                <FormError errors={form.errors} />
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-end">
                  <div className="flex gap-6">
                    <Button variant={"outline"} asChild>
                      <Link to={"/profile"}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      Change{" "}
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
