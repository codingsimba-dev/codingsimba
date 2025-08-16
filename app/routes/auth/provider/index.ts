import { ProviderNameSchema } from "~/components/connection-form";
import type { Route } from "./+types/index";
import { redirect } from "react-router";
import { handleMockAction } from "~/utils/connection.server";
import { getReferrerRoute } from "~/utils/misc";
import { getRedirectCookieHeader } from "~/utils/redirect-cookie.server";
import { authenticator } from "../../../utils/auth.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request, params }: Route.ActionArgs) {
  const providerName = ProviderNameSchema.parse(params.provider);
  try {
    await handleMockAction(providerName, request);
    return await authenticator.authenticate(providerName, request);
  } catch (error: unknown) {
    if (error instanceof Response) {
      const formData = await request.formData();
      const rawRedirectTo = formData.get("redirectTo");
      const redirectTo =
        typeof rawRedirectTo === "string"
          ? rawRedirectTo
          : getReferrerRoute(request);
      const redirectToCookie = getRedirectCookieHeader(redirectTo);
      if (redirectToCookie) {
        error.headers.append("set-cookie", redirectToCookie);
      }
    }
    throw error;
  }
}
