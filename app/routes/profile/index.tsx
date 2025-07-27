import React from "react";
import type { Route } from "../profile/+types";
import { SideNav } from "./components/side-nav";
import { Account } from "./components/account";
import {
  Award,
  Bell,
  BookOpen,
  CreditCard,
  User,
  Bookmark,
  Flag,
  type LucideIcon,
} from "lucide-react";
import { Courses } from "./components/courses";
import { Certificates } from "./components/certificates";
import { Subscription } from "./components/subscription";
import { Bookmarks } from "./components/bookmarks";
import { ContentReports } from "./components/content-reports";
import { Notifications } from "./components/notifications";
import { requireUserId } from "../../utils/auth.server";
import { generateMetadata } from "~/utils/meta";
import { useSearchParams, useLoaderData } from "react-router";
import {
  getReports,
  getBookmarks,
  getSubscription,
  getUserProfle,
} from "./loader.server";
import { handleActions } from "./action.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const user = await getUserProfle(userId);
  const subscription = await getSubscription(userId);
  const bookmarks = await getBookmarks(userId);
  const reports = await getReports(userId);
  return { user, subscription, bookmarks, reports };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  return await handleActions(request, userId);
}

export type TabValue =
  | "Account"
  | "My Courses"
  | "Certificates"
  | "Subscription"
  | "Notifications"
  | "Bookmarks"
  | "Content Reports";

export default function ProfileRoute() {
  const metadata = generateMetadata({ title: "Profile" });
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookmarks, reports } =
    useLoaderData<Route.ComponentProps["loaderData"]>();

  const tabs = [
    { value: "Account", Icon: User },
    { value: "My Courses", Icon: BookOpen },
    { value: "Certificates", Icon: Award },
    { value: "Subscription", Icon: CreditCard },
    { value: "Notifications", Icon: Bell },
    { value: "Bookmarks", Icon: Bookmark },
    { value: "Content Reports", Icon: Flag },
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
      case "Bookmarks":
        return <Bookmarks bookmarks={bookmarks} />;
      case "Content Reports":
        return <ContentReports reports={reports} />;
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
