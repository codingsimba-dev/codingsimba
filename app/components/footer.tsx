import {
  content,
  legal,
  learning,
  platform,
  slogan,
  social,
} from "~/constants/navlinks";
import { NavLink } from "./nav-link";
import { Logo } from "./logo";
import { useLocation } from "react-router";
import { cn } from "~/utils/misc";

export function Footer() {
  const location = useLocation();
  const hideFooter =
    location.pathname.includes("signup") ||
    location.pathname.includes("signin");

  return (
    <footer
      className={cn("border-border border-t py-12", {
        "p hidden": hideFooter,
      })}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <section className="mb-6 md:mb-0">
            <Logo />
            <p className="text-muted-foreground mt-2">{slogan}</p>
          </section>

          <section className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            <div>
              <h3 className="text-foreground mb-3 font-medium">Learning</h3>
              <ul className="space-y-2">
                {learning.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      key={item.name}
                      name={item.name}
                      path={item.path}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-foreground mb-3 font-medium">Platform</h3>
              <ul className="space-y-2">
                {[...platform, ...content].map((item) => (
                  <li key={item.name}>
                    <NavLink
                      key={item.name}
                      name={item.name}
                      path={item.path}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-foreground mb-3 font-medium">Legal</h3>
              <ul className="space-y-2">
                {legal.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      key={item.name}
                      name={item.name}
                      path={item.path}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-foreground mb-3 font-medium">Social</h3>
              <ul className="space-y-2">
                {social.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      key={item.name}
                      name={item.name}
                      path={item.path}
                    />
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
  );
}
