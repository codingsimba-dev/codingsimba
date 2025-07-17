import { redirect } from "react-router";
import type { Route } from "../../routes/resources/+types/unsubscribe";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: Route.ActionArgs) {
  console.log(await request);
  return {};
}
