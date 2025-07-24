import type { Route } from "../+types/index";
import { z } from "zod";
import {
  AlertTriangle,
  Download,
  Mail,
  RectangleEllipsis,
  Users,
} from "lucide-react";
import { Link, useFetcher, useLoaderData, useSubmit } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Container } from "./container";
import { cn } from "~/utils/misc";

export const SIGNOUT_SESSIONS_INTENT = "signout-other-sessions";
export const DELETE_USER_INTENT = "delete-user";

export const SessionSchema = z.object({ userId: z.string() });
export const DeleteUserSchema = z.object({ userId: z.string() });

export function DataAndSecurity() {
  const submit = useSubmit();
  const fetcher = useFetcher();
  const loaderData = useLoaderData() as Route.ComponentProps["loaderData"];

  const user = loaderData.user;
  const otherSessionsCount = user._count.sessions - 1;

  return (
    <Container title="Data and Security">
      <Item
        title="Change Email"
        description={
          <>
            Change your email from{" "}
            <span className="font-bold">{user.email}</span>
          </>
        }
      >
        <Button variant="outline" asChild>
          <Link to={"/profile/change-email"}>
            <Mail className="mr-1 size-4" />
            Change
          </Link>
        </Button>
      </Item>
      <Item
        title="Update Password"
        description="Update your password to a new, secure one"
        className="mt-4"
      >
        <Button variant="outline" asChild>
          <Link to={"/profile/password"}>
            <RectangleEllipsis className="mr-1 size-4" />
            Update
          </Link>
        </Button>
      </Item>

      <Item
        title="Download Your Data"
        description="Get a copy of all your data stored in your account"
        className="mt-4"
      >
        <Button variant="outline">
          <a
            href="/download-user-data"
            download="codingsimba-data"
            className="flex items-center"
          >
            <Download className="mr-2 size-4" />
            Download
          </a>
        </Button>
      </Item>

      <Item
        title="Active Sessions"
        description={
          otherSessionsCount
            ? "Sign out from all other devices where you're signed in"
            : "This is your only session"
        }
        className="mt-4"
      >
        {otherSessionsCount ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 size-4" />
                Sign Out {otherSessionsCount} Other Sessions
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Sign out from other devices?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out from all other devices where
                  you&apos;re currently logged in. You&apos;ll remain signed in
                  on this device. This is useful if you&apos;ve forgotten to
                  sign out on another device or if you suspect unauthorized
                  access.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    fetcher.submit(
                      { intent: SIGNOUT_SESSIONS_INTENT, userId: user.id },
                      { method: "post" },
                    )
                  }
                >
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </Item>

      <div className="pt-4">
        <h3 className="mb-1 text-lg font-medium text-red-500 dark:text-red-400">
          Danger Zone
        </h3>
        <p className="text-muted-foreground mb-4">
          Once you delete your account, there is no going back. This action
          cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={"outline"}
              className="border-red-300 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <AlertTriangle className="mr-2 size-4" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete your account?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All your data including your
                profile, courses, certificates, and subscription information
                will be permanently deleted. You will lose access to all
                purchased content and will need to create a new account if you
                wish to return.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  submit(
                    { intent: DELETE_USER_INTENT, userId: user.id },
                    { method: "post" },
                  )
                }
              >
                Yes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Container>
  );
}

function Item({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border flex items-center justify-between border-b pb-4",
        className,
      )}
    >
      <div>
        <h3 className="mb-1 text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
