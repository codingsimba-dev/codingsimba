import { type Submission } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { data } from "react-router";
import { z } from "zod";
import { handleVerification as handleChangeEmailVerification } from "../profile/change-email.server";
import { TOTP } from "~/utils/totp.server";
import { handleVerification as handleOnboardingVerification } from "./onboarding/onboarding.server";
import { handleVerification as handleResetPasswordVerification } from "./reset-password.server";
import {
  VerifySchema,
  codeQueryParam,
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
  type VerificationTypes,
} from "./verify";
import { prisma } from "~/utils/db.server";
import { getDomainUrl } from "~/utils/misc";
import { StatusCodes } from "http-status-codes";

export type VerifyFunctionArgs = {
  request: Request;
  submission: Submission<
    z.input<typeof VerifySchema>,
    string[],
    z.output<typeof VerifySchema>
  >;
  body: FormData | URLSearchParams;
};

export function getRedirectToUrl({
  request,
  type,
  target,
  redirectTo,
}: {
  request: Request;
  type: VerificationTypes;
  target: string;
  redirectTo?: string;
}) {
  const redirectToUrl = new URL(`${getDomainUrl(request)}/verify`);
  redirectToUrl.searchParams.set(typeQueryParam, type);
  redirectToUrl.searchParams.set(targetQueryParam, target);
  if (redirectTo) {
    redirectToUrl.searchParams.set(redirectToQueryParam, redirectTo);
  }
  return redirectToUrl;
}

export async function prepareVerification({
  period,
  request,
  type,
  target,
}: {
  period: number;
  request: Request;
  type: VerificationTypes;
  target: string;
}) {
  const verifyUrl = getRedirectToUrl({ request, type, target });
  const redirectTo = new URL(verifyUrl.toString());

  const { otp, ...verificationConfig } = await TOTP.generateTOTP({
    algorithm: "SHA-256",
    charSet: "ABCDEFGHJKLMNPQRSTUVWXYZ123456789",
    period,
  });
  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  };
  await prisma.verification.upsert({
    where: { target_type: { target, type } },
    create: verificationData,
    update: verificationData,
  });

  verifyUrl.searchParams.set(codeQueryParam, otp);

  return { otp, redirectTo, verifyUrl };
}

export async function isCodeValid({
  code,
  type,
  target,
}: {
  code: string;
  type: VerificationTypes;
  target: string;
}) {
  const verification = await prisma.verification.findUnique({
    where: {
      target_type: { target, type },
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
    },
    select: { algorithm: true, secret: true, period: true, charSet: true },
  });
  if (!verification) return false;
  const result = await TOTP.verifyTOTP({
    otp: code,
    ...verification,
  });
  if (!result) return false;
  return true;
}

export async function validateRequest(
  request: Request,
  body: URLSearchParams | FormData,
) {
  const submission = await parseWithZod(body, {
    schema: VerifySchema.superRefine(async (data, ctx) => {
      const codeIsValid = await isCodeValid({
        code: data[codeQueryParam],
        type: data[typeQueryParam],
        target: data[targetQueryParam],
      });
      if (!codeIsValid) {
        ctx.addIssue({
          path: ["code"],
          code: z.ZodIssueCode.custom,
          message: `Invalid code`,
        });
        return;
      }
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return data(
      { ...submission.reply() },
      {
        status:
          submission.status === "error"
            ? StatusCodes.BAD_REQUEST
            : StatusCodes.OK,
      },
    );
  }

  const { value: submissionValue } = submission;

  async function deleteVerification() {
    await prisma.verification.delete({
      where: {
        target_type: {
          type: submissionValue[typeQueryParam],
          target: submissionValue[targetQueryParam],
        },
      },
    });
  }

  switch (submissionValue[typeQueryParam]) {
    case "reset_password": {
      await deleteVerification();
      return handleResetPasswordVerification({ request, body, submission });
    }
    case "onboarding": {
      await deleteVerification();
      return handleOnboardingVerification({ request, body, submission });
    }
    case "change_email": {
      await deleteVerification();
      return handleChangeEmailVerification({ request, body, submission });
    }
  }
}
