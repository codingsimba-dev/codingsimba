import { redirect } from "react-router";
import type { Route } from "./+types/signout";
import { signout } from "~/utils/auth.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: Route.ActionArgs) {
  await signout({ request });
  return {};
}
