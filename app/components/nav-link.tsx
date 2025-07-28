import { NavLink as RouterNavLink } from "react-router";
import { cn } from "~/utils/misc";

type NavLinkProps = {
  name: string;
  path: string;
  type?: string;
  onClick?: () => void;
  className?: string;
};

export function NavLink({
  path,
  name,
  type = "footer",
  onClick,
  className,
}: NavLinkProps) {
  return (
    <RouterNavLink
      prefetch="intent"
      to={path}
      onClick={onClick}
      className={({ isActive }: { isActive: boolean }) =>
        cn(
          "text-foreground hover:text-foreground m-0 p-0 capitalize transition-colors",
          { "text-lg": type === "navbar" },
          isActive ? "underline dark:text-white" : "",
          className,
        )
      }
    >
      {name}
    </RouterNavLink>
  );
}
