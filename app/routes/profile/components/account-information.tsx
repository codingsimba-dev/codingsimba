import type { Route } from "../+types/index";
import { useActionData, useFetcher, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { z } from "zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { FormError } from "~/components/form-errors";
import { Container } from "./container";
import { EmailSchema, NameSchema } from "~/utils/user-validation";
import { useIsPending } from "~/utils/misc";

export const ACCOUNT_INFORMATION_INTENT = "update-profile";

export const AcccountInformationSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  intent: z.literal(ACCOUNT_INFORMATION_INTENT),
});

export function AccountInformation() {
  const fetcher = useFetcher();
  const actionData = useActionData() as Route.ComponentProps["actionData"];
  const loaderData = useLoaderData() as Route.ComponentProps["loaderData"];

  const user = loaderData.user;
  const isSaving = useIsPending();

  const [form, fields] = useForm({
    id: "account-information",
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AcccountInformationSchema });
    },
    shouldValidate: "onBlur",
    defaultValue: {
      email: user.email,
      name: user.name,
    },
  });

  return (
    <Container title="Basic Information" className="mb-8">
      <fetcher.Form {...getFormProps(form)} method="post" className="space-y-6">
        <input type="hidden" name="intent" value={ACCOUNT_INFORMATION_INTENT} />

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={fields.name.id}>Name</Label>
              <Input
                {...getInputProps(fields.name, { type: "text" })}
                defaultValue={user.name}
                className="border-border bg-background h-12 !text-lg"
              />
              <FormError errors={fields.name.errors} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={fields.email.id}>Email</Label>
              <Input
                {...getInputProps(fields.email, { type: "email" })}
                defaultValue={user.email}
                className="border-border bg-background h-12 !text-lg"
                readOnly
              />
              <FormError errors={fields.email.errors} />
            </div>
          </div>
        </div>

        <FormError errors={form.errors} />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </fetcher.Form>
    </Container>
  );
}
