import { Link } from "react-router";

export function FormConsent({ type }: { type: "signup" | "signin" }) {
  return (
    <p className="-my-1 text-xs">
      By signing {type === "signup" ? "up" : "in"}, you agree to our{" "}
      <Link
        to={"/legal/terms-of-use"}
        className="text-blue-700 dark:text-blue-500"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        to={"/legal/privacy-policy"}
        className="text-blue-700 dark:text-blue-500"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
