import React from "react";
import { z } from "zod";
import type { Route } from "../profile/+types";
import { SideNav } from "./components/side-nav";
import { Account } from "./components/account";
import {
  Award,
  Bell,
  BookOpen,
  CreditCard,
  User,
  type LucideIcon,
} from "lucide-react";
import { Courses } from "./components/courses";
import { Certificates } from "./components/certificates";
import { Subscription } from "./components/subscription";
import {
  Notifications,
  NotificationSettingsSchema,
  UPDATE_NOTIFICATIONS_INTENT,
} from "./components/notifications";
import { requireUserId, sessionKey } from "../../utils/auth.server";
import { prisma } from "~/utils/db.server";
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
import { generateMetadata } from "~/utils/meta";
import { redirectWithToast } from "~/utils/toast.server";
import { useSearchParams } from "react-router";
import { getSubscription } from "~/utils/subcription.server";

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

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const subscription = await getSubscription(
    "8ce5c81d-3ee8-4db0-bf29-3764669cc414",
  );
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isSubscribed: true,
      notificationSettings: true,
      image: { select: { fileKey: true } },
      _count: {
        select: {
          sessions: {
            where: {
              expirationDate: { gt: new Date() },
            },
          },
        },
      },
    },
  });
  return { user, subscription };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
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

export type TabValue =
  | "Account"
  | "My Courses"
  | "Certificates"
  | "Subscription"
  | "Notifications";

export default function ProfileRoute() {
  const metadata = generateMetadata({ title: "Profile" });
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = [
    { value: "Account", Icon: User },
    { value: "My Courses", Icon: BookOpen },
    { value: "Certificates", Icon: Award },
    { value: "Subscription", Icon: CreditCard },
    { value: "Notifications", Icon: Bell },
  ] as { value: TabValue; Icon: LucideIcon }[];

  const tabValues = tabs.map((tab) => tab.value);
  const tabFromUrl = searchParams.get("tab") as TabValue;

  const [activeTab, setActiveTab] = React.useState<TabValue>(
    tabFromUrl && tabValues.includes(tabFromUrl) ? tabFromUrl : tabValues[0],
  );

  const handleTabChange = React.useCallback(
    (newTab: TabValue) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("tab", newTab);
          return newParams;
        },
        { preventScrollReset: true },
      );
      setActiveTab(newTab);
    },
    [setSearchParams],
  );

  function renderTab() {
    switch (activeTab) {
      case "Account":
        return <Account />;
      case "My Courses":
        return <Courses />;
      case "Certificates":
        return <Certificates />;
      case "Subscription":
        return <Subscription />;
      case "Notifications":
        return <Notifications />;
      default:
        return <Account />;
    }
  }

  return (
    <>
      {metadata}
      <div className="my-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20">
                <SideNav
                  tabs={tabs}
                  activeTab={activeTab}
                  setActiveTab={handleTabChange}
                />
              </div>
            </div>
            <div
              className="lg:col-span-3"
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {renderTab()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
