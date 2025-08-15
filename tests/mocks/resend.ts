import React from "react";
import { http, HttpResponse, type HttpHandler } from "msw";
import { faker } from "@faker-js/faker";
import { z } from "zod";
import { RESEND_URL } from "~/utils/email.server";

const EmailSchema = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  react: z.custom<React.ReactNode>().optional(),
});

export const handlers: HttpHandler[] = [
  http.post(`${RESEND_URL}/emails`, async ({ request }) => {
    const body = EmailSchema.parse(await request.json());
    console.info("Mocked email:", body);
    return HttpResponse.json({
      id: faker.string.uuid(),
      from: body.from,
      to: body.to,
      created_at: new Date().toISOString(),
    });
  }),
];
