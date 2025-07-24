import type { Route } from "../+types/index";
import { Camera, LogOut, type LucideIcon } from "lucide-react";
import { Form, Link, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";

import { cn, getSeed } from "~/utils/misc";

import type { TabValue } from "..";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getImgSrc, getInitials } from "~/utils/misc";

type SideNavProps = {
  tabs: { value: TabValue; Icon: LucideIcon }[];
  activeTab: TabValue;
  setActiveTab: (activetab: TabValue) => void;
};

export function SideNav({ tabs, activeTab, setActiveTab }: SideNavProps) {
  const loaderData = useLoaderData() as Route.ComponentProps["loaderData"];
  const user = loaderData.user;
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border border-b p-6 text-center">
        <div className="relative z-20 mx-auto mb-4 size-24 overflow-visible">
          <Link to={"/profile/change-photo"}>
            <Button
              size={"icon"}
              className="absolute -top-1 right-0 size-8 rounded-full outline outline-red-500"
            >
              <Camera className="h-full w-full" />
            </Button>
          </Link>
          <Avatar className="border-border -z-20 size-24 border">
            <AvatarImage
              src={getImgSrc({
                seed: getSeed(user.name),
                path: "users",
                fileKey: user.image?.fileKey,
              })}
              alt={user.name}
            />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-muted-foreground">{user.email}</p>
        <div className="text-muted-foreground mt-2 text-sm">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {user.isSubscribed ? "Premium Plan" : " Free Plan"}
          </span>
        </div>
      </div>
      <nav className="p-4">
        <ul role="tablist" aria-orientation="vertical" className="space-y-1">
          {tabs.map((tab, i) => (
            <TabItem
              key={`${tab.value}-${i}`}
              value={tab.value}
              Icon={tab.Icon}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}
        </ul>
      </nav>
      <Form
        method="post"
        action="/signout"
        className="border-border border-t p-4"
      >
        <Button variant="destructive" className="w-full font-bold">
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </Form>
    </div>
  );
}

interface TabItemProps {
  value: TabValue;
  Icon: LucideIcon;
  activeTab: TabValue;
  setActiveTab: (activeTab: TabValue) => void;
}

function TabItem({ value, Icon, activeTab, setActiveTab }: TabItemProps) {
  const isActive = activeTab === value;

  return (
    <li role="presentation">
      <button
        role="tab"
        aria-selected={isActive}
        aria-label={value}
        tabIndex={isActive ? 0 : -1}
        onClick={() => setActiveTab(value)}
        className={cn(
          "text-foreground hover:bg-muted focus-visible:ring-primary flex w-full items-center rounded-lg px-4 py-2 capitalize focus-visible:outline-none focus-visible:ring-2",
          {
            "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400":
              isActive,
          },
        )}
      >
        <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
        {value}
      </button>
    </li>
  );
}
