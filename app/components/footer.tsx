import {
  content,
  legal,
  learning,
  platform,
  slogan,
  social,
} from "~/utils/constants";
import { NavLink } from "./nav-link";
import { Logo } from "./logo";
import { useLocation } from "react-router";
import { cn } from "~/utils/misc";
import { SubscriptionForm } from "./email-subscription-form";
import { useOptionalUser } from "~/hooks/user";

export function Footer() {
  const pathsToHideFooter = [
    "signup",
    "signin",
    "forgot-password",
    "verify",
    "reset-password",
  ];
  const location = useLocation();
  const user = useOptionalUser();
  const hideFooter = pathsToHideFooter.some((path) =>
    location.pathname.includes(path),
  );
  return (
    <>
      <section
        className={cn("bg-background relative overflow-hidden py-24", {
          "p hidden": user || hideFooter,
        })}
      >
        <div className="to-background absolute inset-0 bg-gradient-to-r from-blue-500/10" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <SubscriptionForm />
          </div>
        </div>
      </section>
      <footer
        className={cn("border-border border-t py-12", {
          "p hidden": hideFooter,
        })}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start justify-between md:flex-row">
            <section className="mb-6 md:mb-0">
              <Logo />
              <p className="text-muted-foreground mt-2">{slogan}</p>
            </section>

            <section className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
              <div>
                <h3 className="text-foreground mb-3 font-medium">Learning</h3>
                <ul className="space-y-2">
                  {learning.map((item) => (
                    <li key={item.name} className="text-muted-foreground">
                      <NavLink name={item.name} path={item.path} />
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-foreground mb-3 font-medium">Platform</h3>
                <ul className="space-y-2">
                  {[...content, ...platform].map((item) => (
                    <li key={item.name}>
                      <NavLink name={item.name} path={item.path} />
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-foreground mb-3 font-medium">Legal</h3>
                <ul className="space-y-2">
                  {legal.map((item) => (
                    <li key={item.name}>
                      <NavLink name={item.name} path={item.path} />
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-foreground mb-3 font-medium">Social</h3>
                <ul className="space-y-2">
                  {social.map((item) => (
                    <li key={item.name}>
                      <NavLink name={item.name} path={item.path} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="border-border text-muted-foreground mt-12 border-t pt-8 text-center text-sm">
            © 2025 - present Coding Simba. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
