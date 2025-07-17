import { http, HttpResponse, type HttpHandler } from "msw";
import { faker } from "@faker-js/faker";

const STORAGE_URL = /^https:\/\/storage\.bunnycdn\.com\/.*$/;

export const handlers: HttpHandler[] = [
  http.put(STORAGE_URL, async ({ request }) => {
    const body = await request.arrayBuffer();
    const imageUrl = faker.image.url();
    console.log(
      `Mocked file upload to Bunny - received ${body.byteLength} bytes  and returned ${imageUrl}`,
    );
    return HttpResponse.json({ ok: true, url: imageUrl });
  }),

  http.delete(STORAGE_URL, async ({ request }) => {
    const imageUrl = request.url;
    console.log(`Mocked file delete from Bunny, URL: ${imageUrl}`);
    return HttpResponse.json({ ok: true, url: imageUrl });
  }),
];
