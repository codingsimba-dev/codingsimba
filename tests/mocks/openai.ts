import { http, passthrough, type HttpHandler } from "msw";

const BASE_URL = /https:\/\/api\.openai\.com\/v1/;

export const handlers: HttpHandler[] = [
  http.post(BASE_URL, async () => {
    return passthrough();
  }),
];
