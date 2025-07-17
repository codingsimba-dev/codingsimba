import type { Route } from "./+types/checkout";
import { SubscriptionType } from "~/generated/prisma";
import { createCheckoutSession } from "~/utils/subcription.server";
import { requireUser } from "~/utils/auth.server";
import { getDomainUrl, getErrorMessage, invariant } from "~/utils/misc";
import { redirect } from "react-router";
import { prisma } from "~/utils/db.server";
import { redirectWithToast } from "~/utils/toast.server";

export async function action({ request }: Route.ActionArgs) {
  try {
    const url = getDomainUrl(request);
    const user = await requireUser(request, { redirectTo: "/signin" });
    const formData = await request.formData();
    const products = formData.getAll("products").map((p) => String(p));
    const group = String(formData.get("group")) as SubscriptionType;
    invariant(products.length > 0 && group, "Products and group are required");
    const successUrl = `${url}/subscription/success?checkout_id={CHECKOUT_ID}`;
    const isTeam = group === SubscriptionType.team;

    const member = isTeam
      ? await prisma.teamMember.findFirst({
          where: { userId: user.id },
          select: { teamId: true },
        })
      : null;

    const response = await createCheckoutSession({
      products,
      successUrl,
      userId: user.id,
      teamId: isTeam ? member?.teamId : undefined,
      customerEmail: user.email,
      customerName: user.name,
      isBusinessCustomer: isTeam,
    });
    return redirect(response.url);
  } catch (error) {
    throw await redirectWithToast("/", {
      type: "error",
      description: getErrorMessage(error),
    });
  }
}
