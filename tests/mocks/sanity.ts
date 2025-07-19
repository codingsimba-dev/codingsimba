import { http, passthrough, type HttpHandler } from "msw";
import { SANITY_API_URL } from "~/utils/content.server/loader";

export const handlers: HttpHandler[] = [
  http.all(`${SANITY_API_URL}*`, async () => {
    return passthrough();
  }),
];
