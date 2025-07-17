import { http, passthrough, type HttpHandler } from "msw";

export const handlers: HttpHandler[] = [
  http.post(/https:\/\/api\.deepseek\.com/, async () => {
    return passthrough();
  }),
];
