import { http, passthrough, type HttpHandler } from "msw";

export const handlers: HttpHandler[] = [
  http.post(/https:\/\/api\.openai\.com\/v1/, async () => {
    return passthrough();
  }),
  http.post(/https:\/\/api\.deepseek\.com/, async () => {
    return passthrough();
  }),
];
