// import * as React from "react";

// export interface TOCItem {
//   id: string;
//   level: number;
//   text: string;
// }

// export type TOCHeadings = TOCItem[];

// export interface UseTOCProps {
//   containerId?: string;
//   selectors?: string;
//   rootMargin?: string;
//   threshold?: number;
// }

// export type UseTOCReturn = {
//   headings: TOCHeadings;
//   activeId: string | null;
// };

// export const useToc = ({
//   containerId = "markdown-content",
//   selectors = "h1, h2, h3, h4, h5, h6",
//   rootMargin = "0px 0px -80% 0px",
//   threshold = 0.1,
// }: UseTOCProps = {}): UseTOCReturn => {
//   const [headings, setHeadings] = React.useState<TOCHeadings>([]);
//   const [activeId, setActiveId] = React.useState<string | null>(null);

//   React.useEffect(() => {
//     const handleHashChange = () => {
//       if (window.location.hash) {
//         setActiveId(window.location.hash.replace("#", ""));
//       }
//     };
//     handleHashChange();
//     window.addEventListener("hashchange", handleHashChange);
//     return () => window.removeEventListener("hashchange", handleHashChange);
//   }, []);

//   React.useEffect(() => {
//     const container = containerId && document.getElementById(containerId);
//     if (!container) {
//       console.warn(`Container with id "${containerId}" not found.`);
//       return;
//     }

//     const headingElements = Array.from(
//       container.querySelectorAll(selectors),
//     ).filter((heading) => Boolean(heading.textContent)) as HTMLElement[];

//     const toc = headingElements.map((heading) => ({
//       id: heading.id,
//       level: parseInt(heading.tagName.substring(1)),
//       text: heading.textContent!,
//     }));

//     setHeadings((prevHeadings) => {
//       if (JSON.stringify(prevHeadings) === JSON.stringify(toc)) {
//         return prevHeadings;
//       }
//       return toc;
//     });

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setActiveId((prevId) => {
//               return prevId !== entry.target.id ? entry.target.id : prevId;
//             });
//           }
//         });
//       },
//       { root: null, rootMargin, threshold },
//     );

//     headingElements.forEach((element) => observer.observe(element));

//     return () => {
//       headingElements.forEach((element) => observer.unobserve(element));
//     };
//   }, [containerId, rootMargin, threshold, selectors]);

//   return { headings, activeId };
// };

import * as React from "react";

export interface TOCItem {
  id: string;
  level: number;
  text: string;
  element?: HTMLElement; // Reference to DOM element for advanced operations
}

export type TOCHeadings = TOCItem[];

export interface UseTOCProps {
  /**
   * ID of the container element to scan for headings
   * @default "markdown-content"
   */
  containerId?: string;
  /**
   * CSS selector string for heading elements
   * @default "h1, h2, h3, h4, h5, h6"
   */
  selectors?: string;
  /**
   * Root margin for IntersectionObserver
   * @default "0px 0px -80% 0px"
   */
  rootMargin?: string;
  /**
   * Intersection threshold (0-1)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Debounce delay for active ID updates (ms)
   * @default 100
   */
  debounceDelay?: number;
  /**
   * Enable automatic ID generation for headings without IDs
   * @default true
   */
  generateIds?: boolean;
  /**
   * Custom ID generator function
   */
  idGenerator?: (text: string, level: number, index: number) => string;
  /**
   * Enable error boundary behavior
   * @default true
   */
  enableErrorHandling?: boolean;
  /**
   * Custom error handler
   */
  onError?: (error: Error, context: string) => void;
}

export interface UseTOCReturn {
  headings: TOCHeadings;
  activeId: string | null;
  error: string | null;
  isLoading: boolean;
  /**
   * Programmatically set active heading
   */
  setActiveHeading: (id: string) => void;
  /**
   * Refresh TOC (useful for dynamic content)
   */
  refresh: () => void;
  /**
   * Navigate to a heading
   */
  navigateToHeading: (id: string, behavior?: ScrollBehavior) => void;
}

// Utility function to generate slug-like IDs
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

// Default ID generator
const defaultIdGenerator = (
  text: string,
  level: number,
  index: number,
): string => {
  const slug = generateSlug(text);
  return slug || `heading-${level}-${index}`;
};

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom hook for managing refs that persist across renders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = React.useRef<T>(callback);

  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return React.useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    [],
  );
}

export const useTOC = ({
  containerId = "markdown-content",
  selectors = "h1, h2, h3, h4, h5, h6",
  rootMargin = "0px 0px -80% 0px",
  threshold = 0.1,
  debounceDelay = 100,
  generateIds = true,
  idGenerator = defaultIdGenerator,
  enableErrorHandling = true,
  onError,
}: UseTOCProps = {}): UseTOCReturn => {
  // State management
  const [headings, setHeadings] = React.useState<TOCHeadings>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [internalActiveId, setInternalActiveId] = React.useState<string | null>(
    null,
  );

  // Refs for cleanup and state management
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const headingElementsRef = React.useRef<HTMLElement[]>([]);
  const mountedRef = React.useRef(true);
  const lastActiveIdRef = React.useRef<string | null>(null);

  // Debounced active ID to prevent rapid state changes
  const debouncedActiveId = useDebounce(internalActiveId, debounceDelay);

  // Error handler
  const handleError = useStableCallback((err: Error, context: string) => {
    if (!enableErrorHandling) return;

    const errorMessage = `useTOC Error in ${context}: ${err.message}`;
    setError(errorMessage);

    if (onError) {
      onError(err, context);
    } else {
      console.error(errorMessage, err);
    }
  });

  // Clear error when dependencies change
  React.useEffect(() => {
    setError(null);
  }, [containerId, selectors, rootMargin, threshold]);

  // Cleanup function
  const cleanup = useStableCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    headingElementsRef.current = [];
  });

  // Handle hash changes for URL navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      if (!mountedRef.current) return;

      try {
        const hash = window.location.hash.replace("#", "");
        if (hash && hash !== lastActiveIdRef.current) {
          setActiveId(hash);
          lastActiveIdRef.current = hash;
        }
      } catch (err) {
        handleError(err as Error, "hashchange handler");
      }
    };

    // Initialize with current hash
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [handleError]);

  // Update active ID when debounced value changes
  React.useEffect(() => {
    if (
      debouncedActiveId !== null &&
      debouncedActiveId !== lastActiveIdRef.current
    ) {
      setActiveId(debouncedActiveId);
      lastActiveIdRef.current = debouncedActiveId;
    }
  }, [debouncedActiveId]);

  // Main effect for scanning and observing headings
  React.useEffect(() => {
    setIsLoading(true);
    cleanup();

    const scanHeadings = async () => {
      try {
        // Validate selector
        if (!selectors || typeof selectors !== "string") {
          throw new Error("Invalid selectors provided");
        }

        // Find container
        const container = containerId
          ? document.getElementById(containerId)
          : document.body;

        if (!container) {
          throw new Error(`Container with id "${containerId}" not found`);
        }

        // Query headings with error handling for invalid selectors
        let headingElements: HTMLElement[];
        try {
          const elements = container.querySelectorAll(selectors);
          headingElements = Array.from(elements) as HTMLElement[];
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (selectorError) {
          throw new Error(`Invalid CSS selector: "${selectors}"`);
        }

        // Filter valid headings and generate IDs if needed
        const validHeadings: HTMLElement[] = [];
        const generatedIds = new Set<string>();

        headingElements.forEach((heading, index) => {
          const textContent = heading.textContent?.trim();
          if (!textContent) return;

          // Generate ID if missing and generateIds is enabled
          if (!heading.id && generateIds) {
            const level = parseInt(heading.tagName.substring(1));
            let generatedId = idGenerator(textContent, level, index);

            // Ensure unique IDs
            let counter = 1;
            const baseId = generatedId;
            while (
              generatedIds.has(generatedId) ||
              document.getElementById(generatedId)
            ) {
              generatedId = `${baseId}-${counter}`;
              counter++;
            }

            heading.id = generatedId;
            generatedIds.add(generatedId);
          }

          if (heading.id) {
            validHeadings.push(heading);
          }
        });

        if (validHeadings.length === 0) {
          console.warn(
            `No valid headings found with selector "${selectors}" in container "${containerId}"`,
          );
          setHeadings([]);
          setIsLoading(false);
          return;
        }

        // Create TOC data
        const newHeadings = validHeadings.map((heading) => ({
          id: heading.id,
          level: parseInt(heading.tagName.substring(1)),
          text: heading.textContent!.trim(),
          element: heading,
        }));

        // Update state only if headings have changed
        setHeadings((prevHeadings) => {
          const hasChanged =
            prevHeadings.length !== newHeadings.length ||
            prevHeadings.some(
              (prev, index) =>
                prev.id !== newHeadings[index]?.id ||
                prev.text !== newHeadings[index]?.text ||
                prev.level !== newHeadings[index]?.level,
            );

          return hasChanged ? newHeadings : prevHeadings;
        });

        // Store reference for cleanup
        headingElementsRef.current = validHeadings;

        // Set up IntersectionObserver
        if (validHeadings.length > 0 && "IntersectionObserver" in window) {
          observerRef.current = new IntersectionObserver(
            (entries) => {
              if (!mountedRef.current) return;

              // Find the most relevant intersecting entry
              const intersectingEntries = entries.filter(
                (entry) => entry.isIntersecting,
              );

              if (intersectingEntries.length > 0) {
                // Sort by intersection ratio and position
                intersectingEntries.sort((a, b) => {
                  const ratioA = a.intersectionRatio;
                  const ratioB = b.intersectionRatio;

                  if (Math.abs(ratioA - ratioB) < 0.01) {
                    // If ratios are similar, prefer the one higher on the page
                    return a.boundingClientRect.top - b.boundingClientRect.top;
                  }

                  return ratioB - ratioA; // Higher ratio first
                });

                const targetId = intersectingEntries[0].target.id;
                if (targetId) {
                  setInternalActiveId(targetId);
                }
              }
            },
            {
              root: null,
              rootMargin,
              threshold: Array.isArray(threshold) ? threshold : [threshold],
            },
          );

          // Observe all heading elements
          validHeadings.forEach((element) => {
            observerRef.current?.observe(element);
          });
        }
      } catch (err) {
        handleError(err as Error, "scanning headings");
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    // Use RAF to ensure DOM is ready
    const rafId = requestAnimationFrame(scanHeadings);

    return () => {
      cancelAnimationFrame(rafId);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    containerId,
    selectors,
    rootMargin,
    threshold,
    generateIds,
    idGenerator,
    handleError,
  ]);

  // Cleanup on unmount
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Utility functions
  const setActiveHeading = useStableCallback((id: string) => {
    if (headings.find((h) => h.id === id)) {
      setActiveId(id);
      setInternalActiveId(id);
      lastActiveIdRef.current = id;
    }
  });

  const refresh = useStableCallback(() => {
    setIsLoading(true);
    // Trigger re-scan by updating a dependency
    setError(null);
  });

  const navigateToHeading = useStableCallback(
    (id: string, behavior: ScrollBehavior = "smooth") => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior, block: "start" });

        // Update URL hash
        if (window.history.replaceState) {
          window.history.replaceState(null, "", `#${id}`);
        } else {
          window.location.hash = id;
        }

        setActiveHeading(id);

        // Focus for accessibility
        if (element.tabIndex === -1) {
          element.tabIndex = -1;
        }
        element.focus({ preventScroll: true });
      }
    },
  );

  return {
    headings,
    activeId,
    error,
    isLoading,
    setActiveHeading,
    refresh,
    navigateToHeading,
  };
};
