import { Link, useLocation } from "react-router";
import {
  DoorClosed,
  FileText,
  Play,
  GraduationCap,
  Target,
  Trophy,
  ChevronDown,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { content, learning } from "~/utils/constants";
import * as Icons from "lucide-react";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "~/components/theme-toggle";
import { cn } from "~/utils/misc";
import { Logo } from "~/components/logo";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useMobileNav } from "~/utils/mobile-nav-provider";
import { useOptionalUser } from "~/hooks/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { getImgSrc, getInitials } from "~/utils/misc";
import { SignoutButton } from "./signout-button";
import { userHasRole } from "~/utils/permissions";

export function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isChatPage = location.pathname.includes("/chat");

  // Icon mapping for learning links
  const learningIcons = {
    articles: FileText,
    tutorials: Play,
    courses: GraduationCap,
    programs: Target,
    challenges: Trophy,
  };

  return (
    <nav
      className={cn(
        "pt-6",
        {
          "bg-transparent": isHomePage,
          "border-border bg-background/80 fixed left-0 right-0 top-0 z-50 w-full border-b pt-0 backdrop-blur-md":
            !isHomePage,
        },
        {
          "p hidden": isChatPage,
        },
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <Logo />
        <div className="hidden items-center gap-6 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden items-center gap-1 px-2 py-1 font-semibold lg:flex">
              Learning
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {learning
                .filter((link) => link.path !== "color-scheme")
                .map((link) => {
                  const IconComponent =
                    learningIcons[link.name as keyof typeof learningIcons];
                  return (
                    <DropdownMenuItem asChild key={link.name}>
                      <Link
                        to={link.path}
                        prefetch="intent"
                        className="flex items-center gap-2 font-bold capitalize"
                      >
                        {IconComponent && <IconComponent className="size-4" />}
                        {link.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {content.map((link) => (
            <NavLink
              type="navbar"
              key={link.name}
              name={link.name}
              path={link.path}
            />
          ))}
        </div>
        <AuthButtons />
      </div>
    </nav>
  );
}

export function AuthButtons() {
  const user = useOptionalUser();
  const location = useLocation();
  const { openMobileNav } = useMobileNav();

  const image = user?.image;
  const userIsAdmin = userHasRole(user, "ADMIN");
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;
  const params = new URLSearchParams({ redirectTo });

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      {!user ? (
        <Button className="hidden lg:flex" asChild>
          <Link to={{ pathname: "/signin", search: params.toString() }}>
            Sign In
          </Link>
        </Button>
      ) : null}
      {userIsAdmin ? (
        <Button size={"icon"} variant={"outline"} asChild>
          <Link to={"/admin"}>
            <DoorClosed />
          </Link>
        </Button>
      ) : null}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="hidden lg:block" asChild>
            <Avatar className="border-border size-8 cursor-pointer border">
              <AvatarImage
                src={getImgSrc({
                  fileKey: image?.fileKey,
                  seed: user.name,
                })}
                alt={user.name}
              />
              <AvatarFallback className="border-border border">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link to={"/profile"} prefetch="intent" className="font-bold">
                <Icons.UserPen className="mr-2 size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <Separator className="my-1" />
            <SignoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <Button
        size={"icon"}
        variant={"ghost"}
        className="block lg:hidden"
        onClick={openMobileNav}
      >
        <Icons.Menu />
      </Button>
    </div>
  );
}
