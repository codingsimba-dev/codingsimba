import type { Route } from "./+types/index";
import { z } from "zod";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import {
  data,
  Form,
  redirect,
  useSearchParams,
  type Params,
} from "react-router";
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
import {
  // authenticator,
  requireAnonymous,
  sessionKey,
  signupWithConnection,
} from "~/utils/auth.server";
import { verifySessionStorage } from "~/utils/verification.server";
import { safeRedirect } from "remix-utils/safe-redirect";
import { ProviderNameSchema } from "~/components/connection-form";
import { authSessionStorage } from "~/utils/session.server";
import { onboardingSessionKey } from ".";
import { RememberMeSchema } from "~/utils/user-validation";
import { useIsPending } from "~/utils/misc";
import { generateMetadata } from "~/utils/meta";
import { GradientContainer } from "~/components/gradient-container";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { checkHoneypot } from "~/utils/honeypot.server";

export const providerIdKey = "providerId";
export const prefilledProfileKey = "prefilledProfile";

const OnboardingSchema = z.object({
  imageUrl: z.string().optional(),
  name: z.string(),
  redirectTo: z.string().optional(),
  rememberMe: RememberMeSchema,
});

async function requireData({
  request,
  params,
}: {
  request: Request;
  params: Params;
}) {
  await requireAnonymous(request);
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const email = verifySession.get(onboardingSessionKey);
  const providerId = verifySession.get(providerIdKey);
  const result = z
    .object({
      email: z.string(),
      providerName: ProviderNameSchema,
      providerId: z.string(),
    })
    .safeParse({ email, providerName: params.provider, providerId });
  if (result.success) {
    return result.data;
  } else {
    console.error(result.error);
    throw redirect("/signup");
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAnonymous(request);
  const { email } = await requireData({ request, params });
  // const authSession = await authSessionStorage.getSession(
  //   request.headers.get("cookie"),
  // );
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const prefilledProfile = verifySession.get(prefilledProfileKey);

  // const formError = authSession.get(authenticator.sessionErrorKey);

  return data({
    email,
    submission: {
      intent: "",
      payload: (prefilledProfile ?? {}) as Record<string, unknown>,
      error: {
        // "": typeof formError === "string" ? [formError] : [],
        "": ["Error"],
      },
    },
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  const { email, providerId, providerName } = await requireData({
    request,
    params,
  });

  const formData = await request.formData();
  await checkHoneypot(formData);
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie"),
  );

  const submission = await parseWithZod(formData, {
    schema: OnboardingSchema.transform(async (data) => {
      const session = await signupWithConnection({
        ...data,
        email,
        providerId,
        providerName,
      });
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

  const { session, rememberMe, redirectTo } = submission.value;

  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  authSession.set(sessionKey, session.id);
  const headers = new Headers();
  headers.append(
    "set-cookie",
    await sessionStorage.commitSession(authSession, {
      expires: rememberMe ? session.expirationDate : undefined,
    }),
  );
  headers.append(
    "set-cookie",
    await verifySessionStorage.destroySession(verifySession),
  );
  return redirect(safeRedirect(redirectTo), { headers });
}

export default function OnboardingProvider({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Onboarding" });
  const isSubmitting = useIsPending();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const email = loaderData.email;

  const [form, fields] = useForm({
    id: "onboarding-provider",
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: OnboardingSchema });
    },
    shouldValidate: "onBlur",
    defaultValue: { redirectTo },
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
                <input
                  {...getInputProps(fields.redirectTo, { type: "hidden" })}
                  value={redirectTo ?? ""}
                />
                <HoneypotInputs />
                <div className="space-y-2">
                  <Label htmlFor={fields.name.id}>Name</Label>
                  <Input
                    {...getInputProps(fields.name, { type: "text" })}
                    placeholder="Kent C. Dodds"
                  />
                  <FormError errors={fields.name.errors} />
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
