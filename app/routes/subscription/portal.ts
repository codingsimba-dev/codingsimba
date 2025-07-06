import { CustomerPortal } from "@polar-sh/remix";
// import { requireUserId } from "~/utils/auth.server";

const { NODE_ENV } = process.env;

export const loader = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCustomerId: async (event) => "b2c16e9b-02ef-4487-9428-39ca7bb71ada",
  // getCustomerId: async (event) => await requireUserId(event),
  server: NODE_ENV === "development" ? "sandbox" : "production",
});
