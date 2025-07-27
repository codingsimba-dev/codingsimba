import { sessionKey } from "../../utils/auth.server";
import { prisma } from "~/utils/db.server";
import { z } from "zod";

import {
  AcccountInformationSchema,
  ACCOUNT_INFORMATION_INTENT,
} from "./components/account-information";
import { parseWithZod } from "@conform-to/zod";
import { data } from "react-router";
import { StatusCodes } from "http-status-codes";
import {
  DELETE_USER_INTENT,
  DeleteUserSchema,
  SessionSchema,
  SIGNOUT_SESSIONS_INTENT,
} from "./components/data-and-security";
import { authSessionStorage } from "~/utils/session.server";
import { invariantResponse } from "~/utils/misc";
import { redirectWithToast } from "~/utils/toast.server";
import {
  NotificationSettingsSchema,
  UPDATE_NOTIFICATIONS_INTENT,
} from "./components/notifications";

const IntentSchema = z.object({
  intent: z.enum([
    ACCOUNT_INFORMATION_INTENT,
    UPDATE_NOTIFICATIONS_INTENT,
    SIGNOUT_SESSIONS_INTENT,
    DELETE_USER_INTENT,
  ]),
});

const AcccountUpdateSchema = z.union([
  IntentSchema.merge(AcccountInformationSchema),
  IntentSchema.merge(NotificationSettingsSchema),
  IntentSchema.merge(SessionSchema),
  IntentSchema.merge(DeleteUserSchema),
]);

export async function handleActions(request: Request, userId: string) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: AcccountUpdateSchema.transform(async (data, ctx) => {
      switch (data.intent) {
        case ACCOUNT_INFORMATION_INTENT: {
          const { name } = data as z.infer<typeof AcccountInformationSchema>;
          const user = await prisma.user.update({
            where: { id: userId },
            select: { id: true },
            data: { name },
          });
          if (!user) {
            ctx.addIssue({
              path: ["root"],
              code: z.ZodIssueCode.custom,
              message: "Failed to save changes, please try again.",
            });
            return z.NEVER;
          }
          return { ...data, user };
        }

        case UPDATE_NOTIFICATIONS_INTENT: {
          const {
            userId,
            contentUpdate,
            promotions,
            communityEvents,
            allNotifications,
          } = data as z.infer<typeof NotificationSettingsSchema>;

          const updateData = {
            contentUpdate,
            promotions,
            communityEvents,
            allNotifications,
          };
          const notification = await prisma.notificationSetting.update({
            where: { userId },
            select: { id: true },
            data: {
              ...updateData,
            },
          });
          if (!notification) {
            ctx.addIssue({
              path: ["root"],
              code: z.ZodIssueCode.custom,
              message: "Failed to save changes, please try again.",
            });
            return z.NEVER;
          }
          return { ...data, notification };
        }

        case SIGNOUT_SESSIONS_INTENT: {
          const { userId } = data;

          const authSession = await authSessionStorage.getSession(
            request.headers.get("cookie"),
          );
          const sessionId = authSession.get(sessionKey);
          invariantResponse(
            sessionId,
            "You must be authenticated to sign out of other sessions",
          );
          await prisma.session.deleteMany({
            where: {
              userId,
              id: { not: sessionId },
            },
          });
          return data;
        }

        case DELETE_USER_INTENT: {
          const { userId } = data;
          await prisma.user.delete({ where: { id: userId } });
          throw redirectWithToast("/", {
            title: "Delete success",
            description: "Account delete success",
            type: "success",
          });
        }

        default:
          throw new Error("Invalid Intent");
      }
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return data({ status: "error", ...submission.reply() } as const, {
      status:
        submission.status === "error"
          ? StatusCodes.BAD_REQUEST
          : StatusCodes.OK,
    });
  }

  return data(submission);
}
