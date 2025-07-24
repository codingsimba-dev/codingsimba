import { createCookieSessionStorage } from "react-router";
import { type ProviderName } from "~/components/connection-form";
import { GitHubProvider } from "./providers/github.server";
import { type AuthProvider } from "./providers/provider";
import { domain } from "./constants";

export const connectionSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__tb_connection",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    secrets: process.env.SESSION_SECRET.split(","),
    secure: true,
    ...(process.env.NODE_ENV === "production"
      ? {
          domain: domain,
        }
      : {}),
  },
});

export const providers: Record<ProviderName, AuthProvider> = {
  github: new GitHubProvider(),
};

export async function handleMockAction(
  providerName: ProviderName,
  request: Request,
) {
  return providers[providerName].handleMockAction(request);
}

export async function resolveConnectionData(
  providerName: ProviderName,
  providerId: string,
) {
  return providers[providerName].resolveConnectionData(providerId);
}
