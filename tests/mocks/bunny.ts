import { http, HttpResponse, type HttpHandler } from "msw";
import { faker } from "@faker-js/faker";

// In-memory storage to simulate file uploads and deletions
const mockBunnyStorage = new Map<string, { data: ArrayBuffer; url: string }>();
const STORAGE_URL = /^https:\/\/storage\.bunnycdn\.com\/.*$/;

export const handlers: HttpHandler[] = [
  // Mock file upload
  http.put(STORAGE_URL, async ({ request }) => {
    const body = await request.arrayBuffer();
    // Generate a fake filename and URL
    const filename = faker.system.fileName();
    const imageUrl = `https://storage.bunnycdn.com/mock/${filename}`;
    // Store the file in the mock storage
    mockBunnyStorage.set(filename, { data: body, url: imageUrl });
    console.log(
      `Mocked file upload to Bunny - received ${body.byteLength} bytes, stored as ${filename}, and returned ${imageUrl}`,
    );
    return HttpResponse.json({ ok: true, url: imageUrl });
  }),

  // Mock file delete
  http.delete(STORAGE_URL, async ({ request }) => {
    // Extract the filename from the URL
    const urlParts = request.url.split("/");
    const filename = urlParts[urlParts.length - 1];
    const existed = mockBunnyStorage.delete(filename);
    console.log(
      `Mocked file delete from Bunny, filename: ${filename}, existed: ${existed}`,
    );
    return HttpResponse.json({ ok: true, url: request.url });
  }),
];
