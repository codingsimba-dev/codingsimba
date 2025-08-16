import closeWithGrace from "close-with-grace";
import { passthrough, http, type HttpHandler } from "msw";
import { setupServer } from "msw/node";
import { handlers as sanityHandlers } from "./sanity";
import { handlers as resendHandlers } from "./resend";
import { handlers as bunnyHandlers } from "./bunny";
import { handlers as githubHandlers } from "./github";
import { handlers as polarHandlers } from "./polar";
import { handlers as voyageHandlers } from "./vogage";
import { handlers as vectorHandlers } from "./vector";
import { handlers as chatbotHandlers } from "./chat";

// React Router Dev Tools
const miscHandlers: HttpHandler[] =
  process.env.NODE_ENV === "development"
    ? [http.post(/http:\/\/localhost:5173\/.*/, passthrough)]
    : [];

export const server = setupServer(
  ...miscHandlers,
  ...resendHandlers,
  ...bunnyHandlers,
  ...sanityHandlers,
  ...githubHandlers,
  ...polarHandlers,
  ...voyageHandlers,
  ...vectorHandlers,
  ...chatbotHandlers,
);
server.listen({ onUnhandledRequest: "warn" });
console.info("🔶 Mock server installed");

closeWithGrace(() => {
  server.close();
});
