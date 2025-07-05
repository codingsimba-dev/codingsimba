import type { Route } from "./+types/checkout";
import { createCheckoutSession } from "~/utils/subcription.server";
import { requireUser } from "~/utils/auth.server";
import { getDomainUrl, invariant } from "~/utils/misc";
import { redirect } from "react-router";

export function loader() {
  return redirect("/");
}

export async function action({ request }: Route.ActionArgs) {
  const url = getDomainUrl(request);
  const user = await requireUser(request);
  const formData = await request.formData();
  const products = String(formData.get("products")).split(",");
  invariant(products.length > 0, "Products are required");
  const successUrl = `${url}/subscription/success?checkout_id={CHECKOUT_ID}`;

  const response = await createCheckoutSession({
    products,
    successUrl,
    userId: user.id,
    customerEmail: user.email,
    customerName: user.name,
  });

  return redirect(response.url);
}
