import {
  useFormAction,
  useNavigation,
  type NavigateFunction,
} from "react-router";
import { type ClassValue, clsx } from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSpinDelay } from "spin-delay";
import { twMerge } from "tailwind-merge";
import type { useUser } from "~/hooks/user";
import { intervalToDuration } from "date-fns";
import { StatusCodes } from "http-status-codes";

/**
 * Generates a random bot avatar URL using the DiceBear API.
 * Creates consistent avatars based on a seed string.
 *
 * @param seed - The seed string to generate the avatar from
 * @returns A URL to the generated avatar image
 *
 * @example
 * ```ts
 * const avatarUrl = getRandomBotAvatar("john-doe");
 * // Returns: "https://api.dicebear.com/9.x/avataaars/svg?seed=john-doe&backgroundColor=b6e3f4,c0aede"
 * ```
 */

export function getRandomBotAvatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede`;
}

/**
 * Extracts the first word from a name string to use as a seed.
 * Useful for generating consistent avatars or other seeded content.
 *
 * @param name - The full name to extract the seed from
 * @returns The first word of the name
 *
 * @example
 * ```ts
 * const seed = getSeed("John Doe Smith"); // "John"
 * const singleName = getSeed("John"); // "John"
 * ```
 */
export function getSeed(name: string) {
  return name.split(" ")[0];
}

/**
 * Gets an image URL either from CDN or generates a random bot avatar
 * @param {string | null | undefined} fileKey - CDN file key
 * @returns {string} Image URL
 */
export function getImgSrc({
  seed = "Kent",
  fileKey,
}: {
  seed?: string;
  fileKey?: string;
}): string {
  const storageZone = "https://cdn.codingsimba.com";
  if (fileKey) {
    return `${storageZone}/images/${encodeURIComponent(fileKey)}`;
  }
  return getRandomBotAvatar(getSeed(seed!));
}

/**
 * Extracts a readable error message from various error types.
 * Handles string errors, Error objects, and unknown error types.
 *
 * @param error - The error to extract message from
 * @returns A string containing the error message
 * @throws Will log to console if error type is unknown
 *
 * @example
 * ```ts
 * const error = new Error("Something went wrong");
 * const message = getErrorMessage(error); // "Something went wrong"
 *
 * const stringError = "Invalid input";
 * const message2 = getErrorMessage(stringError); // "Invalid input"
 * ```
 */
export function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  console.error("Unable to get error message for error", error);
  return "Unknown Error";
}

/**
 * Combines multiple class names and merges Tailwind CSS classes efficiently.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @param inputs - Class names to combine (strings, objects, arrays)
 * @returns A single string of combined and deduplicated class names
 *
 * @example
 * ```ts
 * const classes = cn(
 *   "base-class",
 *   { "conditional-class": true },
 *   ["array-class"],
 *   "tailwind-class"
 * );
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Throws a Response with 400 status if condition is false.
 * Useful for validating request parameters and throwing HTTP errors.
 *
 * @param condition - The condition to check
 * @param message - Error message or function returning message
 * @param responseInit - Additional response options
 * @throws {Response} 400 status response if condition is false
 *
 * @example
 * ```ts
 * invariantResponse(
 *   typeof id === 'string',
 *   'ID must be a string',
 *   { headers: { 'Content-Type': 'application/json' } }
 * );
 * ```
 */
export function invariantResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  condition: any,
  message?: string | (() => string),
  responseInit?: ResponseInit,
): asserts condition {
  if (!condition) {
    throw new Response(
      typeof message === "function"
        ? message()
        : message ||
          "An invariant failed, please provide a message to explain why.",
      { status: StatusCodes.BAD_REQUEST, ...responseInit },
    );
  }
}

/**
 * Throws an Error if condition is false.
 * Similar to invariantResponse but throws Error instead of Response.
 *
 * @param condition - The condition to check
 * @param message - Error message or function returning message
 * @throws {Error} If condition is false
 *
 * @example
 * ```ts
 * invariant(
 *   typeof value === 'string',
 *   'Value must be a string'
 * );
 * ```
 */
export function invariant(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  condition: any,
  message: string | (() => string),
): asserts condition {
  if (!condition) {
    throw new Error(typeof message === "function" ? message() : message);
  }
}

/**
 * Determines if a form is currently being submitted.
 * Uses React Router's navigation state to check form submission status.
 *
 * @param options - Configuration options
 * @param options.formAction - Specific form action to check (defaults to current route)
 * @param options.formMethod - HTTP method to check (defaults to 'POST')
 * @param options.state - Navigation state to check (defaults to 'non-idle')
 * @returns boolean indicating if form is being submitted
 *
 * @example
 * ```ts
 * const isSubmitting = useIsPending({
 *   formMethod: 'POST',
 *   state: 'submitting'
 * });
 * ```
 */
export function useIsPending({
  formAction,
  formMethod = "POST",
  state = "non-idle",
}: {
  formAction?: string;
  formMethod?: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
  state?: "submitting" | "loading" | "non-idle";
} = {}) {
  const contextualFormAction = useFormAction();
  const navigation = useNavigation();
  const isPendingState =
    state === "non-idle"
      ? navigation.state !== "idle"
      : navigation.state === state;
  return (
    isPendingState &&
    navigation.formAction === (formAction ?? contextualFormAction) &&
    navigation.formMethod === formMethod
  );
}

/**
 * Combines useSpinDelay with useIsPending to prevent loading state flicker.
 * Ensures loading spinner shows for minimum duration even if request completes quickly.
 *
 * @param options - Configuration options
 * @param options.delay - Delay before showing spinner (default: 400ms)
 * @param options.minDuration - Minimum spinner display time (default: 300ms)
 * @returns boolean indicating if loading state should be shown
 *
 * @example
 * ```ts
 * const showSpinner = useDelayedIsPending({
 *   delay: 500,
 *   minDuration: 400
 * });
 * ```
 */
export function useDelayedIsPending({
  formAction,
  formMethod,
  delay = 400,
  minDuration = 300,
}: Parameters<typeof useIsPending>[0] &
  Parameters<typeof useSpinDelay>[1] = {}) {
  const isPending = useIsPending({ formAction, formMethod });
  const delayedIsPending = useSpinDelay(isPending, {
    delay,
    minDuration,
  });
  return delayedIsPending;
}

/**
 * Creates a debounced version of a function.
 * Prevents function from being called too frequently by delaying execution
 * and cancelling previous calls if a new call is made within the delay period.
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds before executing the function
 * @returns Debounced function that delays execution
 *
 * @example
 * ```ts
 * const debouncedSearch = debounce((query) => {
 *   searchAPI(query);
 * }, 300);
 *
 * // Multiple rapid calls will only execute the last one after 300ms
 * debouncedSearch("a");
 * debouncedSearch("ab");
 * debouncedSearch("abc"); // Only this call will execute
 * ```
 */
function debounce<Callback extends (...args: Parameters<Callback>) => void>(
  fn: Callback,
  delay: number,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<Callback>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Calls all provided functions with the same arguments.
 * Useful for combining multiple event handlers or callbacks.
 * Safely handles undefined functions by filtering them out.
 *
 * @param fns - Array of functions to call (undefined functions are ignored)
 * @returns Function that calls all provided functions with the same arguments
 *
 * @example
 * ```ts
 * const combinedHandler = callAll(
 *   onBlur,
 *   props.onBlur,
 *   () => console.log('blurred')
 * );
 *
 * // Usage: combinedHandler(event) will call all three functions with event
 * ```
 */
function callAll<Args extends Array<unknown>>(
  ...fns: Array<((...args: Args) => unknown) | undefined>
) {
  return (...args: Args) => fns.forEach((fn) => fn?.(...args));
}

/**
 * Creates a debounced function that persists across renders.
 * Uses useRef to maintain the debounced function instance.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function that persists across renders
 *
 * @example
 * ```ts
 * const debouncedSearch = useDebounce((query) => {
 *   searchAPI(query);
 * }, 300);
 * ```
 */
export function useDebounce<
  Callback extends (...args: Parameters<Callback>) => ReturnType<Callback>,
>(callback: Callback, delay: number) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return useMemo(
    () =>
      debounce(
        (...args: Parameters<Callback>) => callbackRef.current(...args),
        delay,
      ),
    [delay],
  );
}

/**
 * Combines multiple Headers objects into a single Headers instance.
 * Useful for merging headers from different sources.
 *
 * @param headers - Array of Headers objects to combine
 * @returns Combined Headers object
 *
 * @example
 * ```ts
 * const headers = combineHeaders(
 *   new Headers({ 'Content-Type': 'application/json' }),
 *   new Headers({ 'Authorization': 'Bearer token' })
 * );
 * ```
 */
export function combineHeaders(
  ...headers: Array<ResponseInit["headers"] | null>
) {
  const combined = new Headers();
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value);
    }
  }
  return combined;
}

/**
 * Combines multiple ResponseInit objects into a single configuration.
 * Merges headers and other response options.
 *
 * @param responseInits - Array of ResponseInit objects to combine
 * @returns Combined ResponseInit object
 *
 * @example
 * ```ts
 * const responseInit = combineResponseInits(
 *   { status: 200 },
 *   { headers: { 'Content-Type': 'application/json' } }
 * );
 * ```
 */
export function combineResponseInits(
  ...responseInits: Array<ResponseInit | undefined>
) {
  let combined: ResponseInit = {};
  for (const responseInit of responseInits) {
    combined = {
      ...responseInit,
      headers: combineHeaders(combined.headers, responseInit?.headers),
    };
  }
  return combined;
}

/**
 * Hook for implementing double-click confirmation on buttons.
 * First click sets doubleCheck state, second click triggers action.
 *
 * @returns Object containing doubleCheck state and button props
 * @returns {boolean} doubleCheck - Whether button is in confirmation state
 * @returns {function} getButtonProps - Function to get button props
 *
 * @example
 * ```ts
 * const { doubleCheck, getButtonProps } = useDoubleCheck();
 * return (
 *   <button {...getButtonProps({ onClick: handleDelete })}>
 *     {doubleCheck ? "Are you sure?" : "Delete"}
 *   </button>
 * );
 * ```
 */
export function useDoubleCheck() {
  const [doubleCheck, setDoubleCheck] = useState(false);

  function getButtonProps(
    props?: React.ButtonHTMLAttributes<HTMLButtonElement>,
  ) {
    const onBlur: React.ButtonHTMLAttributes<HTMLButtonElement>["onBlur"] =
      () => setDoubleCheck(false);

    const onClick: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"] =
      doubleCheck
        ? undefined
        : (e) => {
            e.preventDefault();
            setDoubleCheck(true);
          };

    const onKeyUp: React.ButtonHTMLAttributes<HTMLButtonElement>["onKeyUp"] = (
      e,
    ) => {
      if (e.key === "Escape") {
        setDoubleCheck(false);
      }
    };

    return {
      ...props,
      onBlur: callAll(onBlur, props?.onBlur),
      onClick: callAll(onClick, props?.onClick),
      onKeyUp: callAll(onKeyUp, props?.onKeyUp),
    };
  }

  return { doubleCheck, getButtonProps };
}

/**
 * Extracts the domain URL from a Request object.
 * Handles both development and production environments.
 *
 * @param request - Request object to extract domain from
 * @returns Full domain URL including protocol
 * @throws {Error} If host cannot be determined
 *
 * @example
 * ```ts
 * const domainUrl = getDomainUrl(request);
 * // Returns "https://example.com" or "http://localhost:3000"
 * ```
 */
export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  const protocol =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

/**
 * Extracts the referrer route from a Request object.
 * Returns the path portion of the referrer URL if it matches the current domain.
 *
 * @param request - Request object to extract referrer from
 * @returns Referrer route path or "/" if referrer is from different domain
 *
 * @example
 * ```ts
 * const referrerRoute = getReferrerRoute(request);
 * // Returns "/dashboard" or "/" if referrer is from different domain
 * ```
 */
export function getReferrerRoute(request: Request) {
  // spelling errors and whatever makes this annoyingly inconsistent
  // in my own testing, `referer` returned the right value, but 🤷‍♂️
  const referrer =
    request.headers.get("referer") ??
    request.headers.get("referrer") ??
    request.referrer;
  const domain = getDomainUrl(request);
  if (referrer?.startsWith(domain)) {
    return referrer.slice(domain.length);
  } else {
    return "/";
  }
}

/**
 * Generates initials from a person's name.
 * Handles various name formats and edge cases.
 *
 * @param name - The full name to generate initials from
 * @returns A string containing the initials (e.g., "JD" for "John Doe")
 *
 * @example
 * ```ts
 * const initials = getInitials("John Doe"); // "JD"
 * const singleName = getInitials("John"); // "J"
 * const withMiddle = getInitials("John A. Doe"); // "JD"
 * ```
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "";

  const words = name
    .split(/\s+/)
    .filter(
      (word) => word.length > 0 && !(word.length === 2 && word.endsWith(".")),
    );

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  const firstInitial = words[0].charAt(0).toUpperCase();
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
}

/**
 * Capitalizes each word in a name string.
 * Handles multiple spaces and preserves existing capitalization patterns.
 *
 * @param name - The name string to capitalize
 * @returns The capitalized name string
 *
 * @example
 * ```ts
 * const name = capitalizeName("john doe"); // "John Doe"
 * const complex = capitalizeName("mary-jane O'connor"); // "Mary-Jane O'Connor"
 * ```
 */
export function capitalizeName(name: string) {
  return name
    .trim()
    .replace(
      /\b\w+/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
}

/**
 * Formats a number of seconds into a human-readable duration string.
 * Uses date-fns for accurate duration calculations and includes appropriate unit labels.
 * Only displays non-zero values and handles singular/plural forms correctly.
 *
 * @param seconds - The number of seconds to format
 * @returns A string with appropriate unit labels (e.g., "1 hr 30 mins 45 secs")
 *
 * @example
 * ```ts
 * formatTime(3661) // "1 hr 1 min 1 sec"
 * formatTime(65)   // "1 min 5 secs"
 * formatTime(45)   // "45 secs"
 * formatTime(3600) // "1 hr"
 * ```
 */
export function formatTime(seconds: number): string {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  const parts = [];

  if (duration.hours && duration.hours > 0) {
    parts.push(`${duration.hours} hr${duration.hours === 1 ? "" : "s"}`);
  }
  if (duration.minutes && duration.minutes > 0) {
    parts.push(`${duration.minutes} min${duration.minutes === 1 ? "" : "s"}`);
  }
  if (duration.seconds && duration.seconds > 0) {
    parts.push(`${duration.seconds} sec${duration.seconds === 1 ? "" : "s"}`);
  }

  return parts.join(" ");
}

/**
 * Creates a wrapper function that requires authentication before execution.
 * If user is not authenticated, redirects to signin page instead of executing the function.
 * Useful for protecting actions that require user authentication.
 *
 * @param options - Configuration options
 * @param options.fn - The function to wrap with authentication check
 * @param options.user - The current user object (null if not authenticated)
 * @param options.navigate - Navigation function to redirect unauthenticated users
 * @returns A function that checks authentication before executing the original function
 *
 * @example
 * ```ts
 * const handleDelete = requireAuth({
 *   fn: deleteItem,
 *   user: currentUser,
 *   navigate: navigate
 * });
 *
 * // Usage: handleDelete(itemId) will either delete the item or redirect to signin
 * ```
 */
export function requireAuth({
  fn,
  user,
  navigate,
}: {
  fn: (...args: unknown[]) => void;
  user: ReturnType<typeof useUser> | null;
  navigate: NavigateFunction;
}) {
  return (...args: unknown[]) => (user ? fn(...args) : navigate("/signin"));
}
