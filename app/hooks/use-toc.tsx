import * as React from "react";

/**
 * Represents a single table of contents item
 *
 * @interface TOCItem
 */
export interface TOCItem {
  /** Unique identifier for the heading */
  id: string;
  /** Heading level (1-6, where 1 is h1, 2 is h2, etc.) */
  level: number;
  /** Text content of the heading */
  text: string;
  /** Reference to the DOM element for advanced operations */
  element?: HTMLElement;
}

/**
 * Array of table of contents items
 */
export type TOCHeadings = TOCItem[];

/**
 * Configuration options for the useTOC hook
 *
 * @interface UseTOCProps
 */
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
   * Root margin for IntersectionObserver (similar to CSS margin)
   * Controls when headings are considered "visible"
   * @default "0px 0px -80% 0px"
   */
  rootMargin?: string;
  /**
   * Intersection threshold (0-1) - percentage of element that must be visible
   * @default 0.1
   */
  threshold?: number;
  /**
   * Debounce delay for active ID updates in milliseconds
   * Prevents rapid state changes during scrolling
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
   * @param text - The heading text content
   * @param level - The heading level (1-6)
   * @param index - The index of the heading in the document
   * @returns A unique ID string
   */
  idGenerator?: (text: string, level: number, index: number) => string;
  /**
   * Enable error boundary behavior
   * @default true
   */
  enableErrorHandling?: boolean;
  /**
   * Custom error handler function
   * @param error - The error that occurred
   * @param context - The context where the error occurred
   */
  onError?: (error: Error, context: string) => void;
}

/**
 * Return value from the useTOC hook
 *
 * @interface UseTOCReturn
 */
export interface UseTOCReturn {
  /** Array of detected headings with their metadata */
  headings: TOCHeadings;
  /** Currently active heading ID (null if none) */
  activeId: string | null;
  /** Error message if something went wrong (null if no error) */
  error: string | null;
  /** Whether the hook is currently scanning for headings */
  isLoading: boolean;
  /**
   * Programmatically set the active heading
   * @param id - The ID of the heading to activate
   */
  setActiveHeading: (id: string) => void;
  /**
   * Refresh the table of contents (useful for dynamic content)
   * Triggers a re-scan of the document for headings
   */
  refresh: () => void;
  /**
   * Navigate to a specific heading
   * @param id - The ID of the heading to navigate to
   * @param behavior - Scroll behavior ("auto", "smooth", or "instant")
   */
  navigateToHeading: (id: string, behavior?: ScrollBehavior) => void;
}

/**
 * Generates a URL-friendly slug from text content
 *
 * Converts text to lowercase, removes special characters,
 * replaces spaces and underscores with hyphens, and
 * removes leading/trailing hyphens.
 *
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug string
 *
 * @example
 * ```ts
 * generateSlug("Hello World!") // "hello-world"
 * generateSlug("Section 2.1") // "section-21"
 * generateSlug("Special@#$%") // "special"
 * ```
 */
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Default ID generator function
 *
 * Creates unique IDs for headings by combining a slugified version
 * of the text with the heading level and index as fallback.
 *
 * @param text - The heading text content
 * @param level - The heading level (1-6)
 * @param index - The index of the heading in the document
 * @returns A unique ID string
 *
 * @example
 * ```ts
 * defaultIdGenerator("Introduction", 1, 0) // "introduction"
 * defaultIdGenerator("Getting Started", 2, 1) // "getting-started"
 * defaultIdGenerator("", 1, 2) // "heading-1-2"
 * ```
 */
const defaultIdGenerator = (
  text: string,
  level: number,
  index: number,
): string => {
  const slug = generateSlug(text);
  return slug || `heading-${level}-${index}`;
};

/**
 * Custom debounce hook for values
 *
 * Delays updating a value until after a specified delay period.
 * Useful for preventing rapid state changes during scrolling.
 *
 * @template T - The type of the value to debounce
 * @param value - The current value
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * ```ts
 * const debouncedScrollPosition = useDebounce(scrollY, 100);
 * ```
 */
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

/**
 * Custom hook for managing stable callback references
 *
 * Ensures that callback functions maintain stable references
 * across renders, preventing unnecessary re-renders of child
 * components that depend on these callbacks.
 *
 * @template T - The type of the callback function
 * @param callback - The callback function to stabilize
 * @returns A stable reference to the callback
 *
 * @example
 * ```ts
 * const stableCallback = useStableCallback(() => {
 *   console.log('This callback has a stable reference');
 * });
 * ```
 */
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

/**
 * Custom hook for creating an interactive table of contents
 *
 * This hook provides a complete solution for creating dynamic table of contents
 * that automatically detects headings, tracks the currently visible section,
 * and provides navigation functionality.
 *
 * ## Features
 *
 * - **Automatic heading detection**: Scans the DOM for heading elements
 * - **Intersection Observer**: Tracks which heading is currently visible
 * - **Debounced updates**: Prevents rapid state changes during scrolling
 * - **URL hash synchronization**: Updates URL hash when navigating to headings
 * - **Error handling**: Graceful error handling with custom error callbacks
 * - **Dynamic content support**: Can refresh when content changes
 * - **Accessibility**: Proper focus management and keyboard navigation
 *
 * ## Usage
 *
 * ```tsx
 * function Article() {
 *   const { headings, activeId, navigateToHeading } = useTOC({
 *     containerId: "article-content",
 *     selectors: "h1, h2, h3",
 *     debounceDelay: 150
 *   });
 *
 *   return (
 *     <div>
 *       <nav>
 *         {headings.map(heading => (
 *           <button
 *             key={heading.id}
 *             onClick={() => navigateToHeading(heading.id)}
 *             className={activeId === heading.id ? 'active' : ''}
 *           >
 *             {heading.text}
 *           </button>
 *         ))}
 *       </nav>
 *       <div id="article-content">
 *         {/* Your article content with h1, h2, h3 elements *\/}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Advanced Usage
 *
 * ```tsx
 * const { headings, activeId, error, isLoading, refresh } = useTOC({
 *   containerId: "dynamic-content",
 *   selectors: "h1, h2, h3, h4",
 *   rootMargin: "0px 0px -70% 0px",
 *   threshold: 0.5,
 *   debounceDelay: 200,
 *   generateIds: true,
 *   idGenerator: (text, level, index) => `section-${level}-${index}`,
 *   enableErrorHandling: true,
 *   onError: (error, context) => {
 *     console.error(`TOC Error in ${context}:`, error);
 *   }
 * });
 * ```
 *
 * @param {UseTOCProps} options - Configuration options for the hook
 * @param {string} [options.containerId="markdown-content"] - ID of the container element
 * @param {string} [options.selectors="h1, h2, h3, h4, h5, h6"] - CSS selectors for headings
 * @param {string} [options.rootMargin="0px 0px -80% 0px"] - IntersectionObserver root margin
 * @param {number} [options.threshold=0.1] - IntersectionObserver threshold
 * @param {number} [options.debounceDelay=100] - Debounce delay in milliseconds
 * @param {boolean} [options.generateIds=true] - Whether to generate IDs for headings
 * @param {Function} [options.idGenerator] - Custom ID generator function
 * @param {boolean} [options.enableErrorHandling=true] - Whether to enable error handling
 * @param {Function} [options.onError] - Custom error handler
 *
 * @returns {UseTOCReturn} Object containing headings, active state, and utility functions
 *
 * @throws {Error} When container is not found or selectors are invalid
 *
 * @example
 * ```tsx
 * // Basic usage
 * const toc = useTOC();
 *
 * // Advanced usage with custom configuration
 * const toc = useTOC({
 *   containerId: "my-content",
 *   selectors: "h1, h2, h3",
 *   rootMargin: "0px 0px -60% 0px",
 *   threshold: 0.2,
 *   debounceDelay: 150,
 *   generateIds: true,
 *   idGenerator: (text, level) => `heading-${level}-${text.toLowerCase().replace(/\s+/g, '-')}`,
 *   enableErrorHandling: true,
 *   onError: (error, context) => {
 *     console.error(`TOC Error in ${context}:`, error);
 *   }
 * });
 * ```
 */
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

  /**
   * Error handler that manages error state and calls custom error handlers
   *
   * @param err - The error that occurred
   * @param context - The context where the error occurred
   */
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

  /**
   * Cleanup function that disconnects observers and clears references
   */
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

    /**
     * Scans the document for headings and sets up intersection observers
     */
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

  /**
   * Programmatically set the active heading
   *
   * @param id - The ID of the heading to activate
   */
  const setActiveHeading = useStableCallback((id: string) => {
    if (headings.find((h) => h.id === id)) {
      setActiveId(id);
      setInternalActiveId(id);
      lastActiveIdRef.current = id;
    }
  });

  /**
   * Refresh the table of contents
   *
   * Triggers a re-scan of the document for headings.
   * Useful when content is dynamically loaded or changed.
   */
  const refresh = useStableCallback(() => {
    setIsLoading(true);
    // Trigger re-scan by updating a dependency
    setError(null);
  });

  /**
   * Navigate to a specific heading
   *
   * Scrolls to the heading, updates the URL hash, sets it as active,
   * and focuses the element for accessibility.
   *
   * @param id - The ID of the heading to navigate to
   * @param behavior - Scroll behavior ("auto", "smooth", or "instant")
   */
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
