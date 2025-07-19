import type { Route } from "./+types/checkout";
import { SubscriptionType } from "~/generated/prisma/client";
import { createCheckoutSession } from "~/utils/subcription.server";
import { requireUser } from "~/utils/auth.server";
import { getDomainUrl, getErrorMessage } from "~/utils/misc";
import { redirect } from "react-router";
import { redirectWithToast } from "~/utils/toast.server";
import { z } from "zod";

const CheckoutSchema = z.object({
  products: z.array(z.string()),
  group: z.nativeEnum(SubscriptionType),
  teamId: z.string().optional(),
});

export async function action({ request }: Route.ActionArgs) {
  try {
    const url = getDomainUrl(request);
    const user = await requireUser(request, { redirectTo: "/signin" });
    const formData = await request.formData();
    const { products, group, teamId } = CheckoutSchema.parse(
      Object.fromEntries(formData),
    );
    const successUrl = `${url}/subscription/success?checkout_id={CHECKOUT_ID}`;
    const isTeam = group === SubscriptionType.team;

    /**
     * TODO:
     * - If it is a team subscription, we will provide them with a modal
     *   to select the team they want to subscribe to.
     * - A user can have more than one team, we need to handle this.
     */

    const response = await createCheckoutSession({
      teamId,
      products,
      successUrl,
      userId: user.id,
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
