import { http, HttpResponse, type HttpHandler } from "msw";
import { faker } from "@faker-js/faker";

// Match the actual Bunny CDN URLs from your code
const STORAGE_URL = /^https:\/\/storage\.bunnycdn\.com\/codingsimba\/.*$/;
const PULL_ZONE_URL = /^https:\/\/codingsimba\.b-cdn\.net\/.*$/;

// Simulate storage to track uploads/deletes
const mockStorage = new Map<
  string,
  { size: number; uploadedAt: Date; contentType: string }
>();

export const handlers: HttpHandler[] = [
  // Video upload - matches your video.server.ts implementation
  http.put(`${STORAGE_URL}videos/:filename`, async ({ request, params }) => {
    const { filename } = params;
    const body = await request.arrayBuffer();
    const contentType = request.headers.get("content-type") || "video/mp4";

    // Validate API key (matches real Bunny CDN)
    const accessKey = request.headers.get("AccessKey");
    if (!accessKey) {
      return HttpResponse.json(
        { error: "AccessKey header required" },
        { status: 401 },
      );
    }

    // Store in mock storage
    mockStorage.set(filename as string, {
      size: body.byteLength,
      uploadedAt: new Date(),
      contentType,
    });

    const videoUrl = `https://codingsimba.b-cdn.net/videos/${filename}`;
    console.log(
      `✅ Bunny: Video uploaded ${filename} (${body.byteLength}b) -> ${videoUrl}`,
    );

    return HttpResponse.json({
      success: true,
      url: videoUrl,
      size: body.byteLength,
    });
  }),

  // Generic file upload
  http.put(STORAGE_URL, async ({ request }) => {
    const body = await request.arrayBuffer();
    const url = new URL(request.url);
    const filename = url.pathname.split("/").pop() || "unknown";
    const contentType =
      request.headers.get("content-type") || "application/octet-stream";

    const accessKey = request.headers.get("AccessKey");
    if (!accessKey) {
      return HttpResponse.json(
        { error: "AccessKey header required" },
        { status: 401 },
      );
    }

    mockStorage.set(filename, {
      size: body.byteLength,
      uploadedAt: new Date(),
      contentType,
    });

    // Generate appropriate URL
    let mockUrl: string;
    if (contentType.startsWith("image/")) {
      mockUrl = faker.image.url({ width: 800, height: 600 });
    } else if (contentType.startsWith("video/")) {
      mockUrl = `https://codingsimba.b-cdn.net/videos/${filename}`;
    } else {
      mockUrl = `https://codingsimba.b-cdn.net/${filename}`;
    }

    console.log(
      `✅ Bunny: ${contentType} uploaded ${filename} (${body.byteLength}b)`,
    );

    return HttpResponse.json({
      success: true,
      url: mockUrl,
      size: body.byteLength,
    });
  }),

  // Thumbnail generation - matches your generateThumbnail function
  http.post(
    `${STORAGE_URL}thumbnails/:thumbnailId`,
    async ({ params, request }) => {
      const { thumbnailId } = params;
      const accessKey = request.headers.get("AccessKey");

      if (!accessKey) {
        return HttpResponse.json(
          { error: "AccessKey header required" },
          { status: 401 },
        );
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const thumbnailUrl = `https://codingsimba.b-cdn.net/thumbnails/${thumbnailId}`;
      console.log(`✅ Bunny: Thumbnail generated -> ${thumbnailUrl}`);

      return HttpResponse.json({
        success: true,
        url: thumbnailUrl,
      });
    },
  ),

  // File deletion
  http.delete(STORAGE_URL, async ({ request }) => {
    const url = new URL(request.url);
    const filename = url.pathname.split("/").pop() || "unknown";
    const accessKey = request.headers.get("AccessKey");

    if (!accessKey) {
      return HttpResponse.json(
        { error: "AccessKey header required" },
        { status: 401 },
      );
    }

    const existed = mockStorage.has(filename);
    if (existed) {
      mockStorage.delete(filename);
    }

    console.log(
      `${existed ? "✅" : "⚠️"} Bunny: ${existed ? "Deleted" : "Not found"} ${filename}`,
    );

    return HttpResponse.json({
      success: true,
      deleted: existed,
      filename,
    });
  }),

  // Pull zone requests (serving files)
  http.get(PULL_ZONE_URL, ({ request }) => {
    const url = new URL(request.url);
    const filename = url.pathname.split("/").pop() || "unknown";

    const file = mockStorage.get(filename);
    if (!file) {
      return HttpResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Return mock file data
    return HttpResponse.arrayBuffer(new ArrayBuffer(file.size), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Length": file.size.toString(),
        ...(file.contentType.startsWith("video/") && {
          "Accept-Ranges": "bytes",
        }),
      },
    });
  }),
];

// Helper functions for testing
export function clearMockStorage(): void {
  mockStorage.clear();
  console.log("🧹 Bunny: Mock storage cleared");
}

export function getMockStorageState() {
  return {
    size: mockStorage.size,
    files: Array.from(mockStorage.keys()),
  };
}
