import { http, passthrough, type HttpHandler } from "msw";

const BASE_URL = /https:\/\/sandbox-api\.polar\.sh\/v1/;

export const handlers: HttpHandler[] = [
  http.post(BASE_URL, async () => {
    return passthrough();
  }),
  http.get(BASE_URL, async () => {
    return passthrough();
  }),
];
