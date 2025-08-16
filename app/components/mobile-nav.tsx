import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Logo } from "./logo";
import { useMobileNav } from "~/utils/mobile-nav-provider";
import { navLinks, learning, slogan, learningIcons } from "~/utils/constants";
import { NavLink } from "./nav-link";
import { Separator } from "./ui/separator";
import { Link, useLocation } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useOptionalUser } from "~/hooks/user";
import { getImgSrc, getInitials } from "~/utils/misc";
import { SignoutButton } from "./signout-button";

export function MobileNav() {
  const { open, closeMobileNav } = useMobileNav();
  const user = useOptionalUser();
  const location = useLocation();
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;
  const params = new URLSearchParams({ redirectTo });
  return (
    <aside>
      <Sheet open={open} onOpenChange={closeMobileNav}>
        <SheetContent side="top" className="border-slate-500">
          <SheetHeader>
            <SheetTitle>
              <Logo />
            </SheetTitle>
            <SheetDescription>{slogan}</SheetDescription>
          </SheetHeader>
          <Separator className="-mt-4" />
          <nav className="flex flex-col items-start gap-3 px-4">
            {/* Learning Links */}
            <div className="w-full">
              <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase tracking-wide">
                Learning
              </h3>
              <div className="flex flex-col gap-2">
                {learning.map((link) => {
                  const IconComponent =
                    learningIcons[link.name as keyof typeof learningIcons];
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={closeMobileNav}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors"
                    >
                      {IconComponent && <IconComponent className="size-4" />}
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Other Navigation Links */}
            {navLinks.map((link, i) => (
              <NavLink
                type="navbar"
                key={`${link.name}-${link.path}-${i}`}
                name={link.name}
                path={link.path}
                onClick={closeMobileNav}
              />
            ))}
            {user ? (
              <div className="-ml-2 mt-1">
                <SignoutButton onClick={closeMobileNav} />
              </div>
            ) : null}
          </nav>
          <Separator />
          <div className="flex justify-center gap-4 px-4 pb-4">
            <ThemeToggle />
            {!user ? (
              <Link to={{ pathname: "/signin", search: params.toString() }}>
                <Button
                  onClick={closeMobileNav}
                  className="flex"
                  variant={"outline"}
                >
                  Sign In
                </Button>
              </Link>
            ) : null}

            {user ? (
              <Link to={"/profile"} onClick={closeMobileNav}>
                <Avatar className="border-border size-9 border">
                  <AvatarImage
                    src={getImgSrc({
                      fileKey: user.image?.fileKey,
                      seed: user.name,
                    })}
                    alt={user.name}
                  />
                  <AvatarFallback className="border-border border">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </aside>
  );
}
