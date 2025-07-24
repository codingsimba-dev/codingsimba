import type { Config } from "@react-router/dev/config";
import { navLinks, legal } from "./app/utils/constants";

const prerenderedRoutes = [
  "/",
  "/signup",
  "/signin",
  "/profile",
  "/not-found",
  "*",
  ...[...navLinks, ...legal].map((link) => `/${link.path}`),
];

export default {
  ssr: true,
  prerender: [...new Set(prerenderedRoutes)],
} satisfies Config;
