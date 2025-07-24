import { createThemeSessionResolver } from "remix-themes";
import { createCookieSessionStorage } from "react-router";
import { domain } from "./constants";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__cs_themes",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: ["s3cr3t"],
    ...(process.env.NODE_ENV === "production"
      ? {
          domain: domain,
          secure: true,
        }
      : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
