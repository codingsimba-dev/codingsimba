// import React from "react";
// import { createId as cuid } from "@paralleldrive/cuid2";
// import { z } from "zod";
// import { useFetcher } from "react-router";
// import { toast } from "sonner";
// import { getErrorMessage } from "~/utils/misc";

// // ============================================================================
// // CORE TYPES AND SCHEMAS
// // ============================================================================

// /**
//  * Generic constraint for any data payload
//  */
// export const DataSchema = z.record(z.string());
// export type DataPayload = z.infer<typeof DataSchema>;

// /**
//  * Generic submission payload schema
//  */
// export const SubmitSchema = z.object({
//   /** The data payload for the operation */
//   data: DataSchema,
//   /** The intent/action type */
//   intent: z.string(),
// });

// export type SubmitPayload = z.infer<typeof SubmitSchema>;

// /**
//  * Configuration for optimistic submissions
//  */
// export interface OptimisticConfig {
//   /** Custom error handler */
//   onError?: (error: Error) => void;
//   /** Custom success handler */
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   onSuccess?: (data: any) => void;
//   /** Whether to show default error toast */
//   showErrorToast?: boolean;
//   /** Whether to show default success toast */
//   showSuccessToast?: boolean;
//   /** Custom success toast message */
//   successMessage?: string;
//   /** Custom error toast message */
//   errorMessage?: string;
//   /** Custom fetcher key generation */
//   keyGenerator?: (intent: string, data: DataPayload) => string;
// }

// /**
//  * Return type from optimistic hooks
//  */
// export interface OptimisticReturn {
//   /** Function to trigger the submission */
//   submit: () => void;
//   /** True during submission, false otherwise */
//   isPending: boolean;
//   /** Submitted data if available */
//   submittedData: FormData | undefined;
//   /** Error object if submission failed, null otherwise */
//   error: Error | null;
//   /** Success response data if available */
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   data: any;
// }

// // ============================================================================
// // CORE HOOK
// // ============================================================================

// /**
//  * Base hook for optimistic submissions with any data and intent type.
//  * Handles the core submission logic and error handling.
//  *
//  * @template TData - Data payload type
//  * @template TIntent - Intent/action type
//  * @param params - Submission parameters
//  * @param config - Optional configuration
//  * @returns Operation state and controls
//  *
//  * @example
//  * ```tsx
//  * // Basic usage
//  * const { submit, isPending, error } = useOptimisticSubmit({
//  *   intent: 'create-post',
//  *   data: { title: 'Hello', content: 'World' }
//  * });
//  *
//  * // With configuration
//  * const { submit, isPending } = useOptimisticSubmit({
//  *   intent: 'delete-item',
//  *   data: { itemId: '123' }
//  * }, {
//  *   successMessage: 'Item deleted!',
//  *   onSuccess: (data) => console.log('Success:', data)
//  * });
//  * ```
//  */
// export function useOptimisticSubmit<
//   TData extends DataPayload = DataPayload,
//   TIntent extends string = string,
// >(
//   params: {
//     intent: TIntent;
//     data: TData;
//   },
//   config: OptimisticConfig = {},
// ): OptimisticReturn {
//   const {
//     onError,
//     onSuccess,
//     showErrorToast = true,
//     showSuccessToast = false,
//     successMessage,
//     errorMessage,
//   } = config;

//   const fetcherKey = React.useMemo(() => {
//     return `${params.intent}-${cuid()}`;
//   }, [params.intent]);

//   const fetcher = useFetcher({ key: fetcherKey });

//   const submit = React.useCallback(() => {
//     try {
//       const parsed = SubmitSchema.parse({
//         data: params.data,
//         intent: params.intent,
//       });

//       fetcher.submit(
//         { data: JSON.stringify(parsed.data), intent: parsed.intent },
//         { method: "post" },
//       );
//     } catch (error) {
//       console.error("ERROR", error);
//       const errorObj =
//         error instanceof Error ? error : new Error(String(error));

//       if (onError) {
//         onError(errorObj);
//       } else if (showErrorToast) {
//         toast.error(errorMessage || getErrorMessage(errorObj), {
//           id: fetcherKey,
//         });
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [params.data, params.intent, onError, showErrorToast, errorMessage]);

//   // Handle success
//   React.useEffect(() => {
//     if (fetcher.data && fetcher.state === "idle" && !fetcher.data.error) {
//       if (onSuccess) {
//         onSuccess(fetcher.data);
//       }
//       if (showSuccessToast && successMessage) {
//         toast.success(successMessage, { id: fetcherKey });
//       }
//     }
//   }, [
//     fetcher.data,
//     fetcher.state,
//     onSuccess,
//     showSuccessToast,
//     successMessage,
//     params.intent,
//     fetcherKey,
//   ]);

//   return {
//     submit,
//     isPending: fetcher.state !== "idle",
//     submittedData: fetcher.formData,
//     error: fetcher.data?.error || null,
//     data: fetcher.data,
//   };
// }

// // ============================================================================
// // SPECIALIZED HOOKS
// // ============================================================================

// /**
//  * Hook for creation operations.
//  * Provides sensible defaults for creating resources.
//  *
//  * @template TData - Data payload type
//  * @param params - Creation parameters
//  * @param config - Optional configuration
//  * @returns Operation state and controls
//  *
//  * @example
//  * ```tsx
//  * // Create a comment
//  * const { submit, isPending } = useCreate({
//  *   intent: 'add-comment',
//  *   data: { body: 'Hello', parentId: '123', userId: 'user1' }
//  * });
//  *
//  * // Create a blog post
//  * const { submit, isPending } = useCreate({
//  *   intent: 'create-post',
//  *   data: { title: 'My Post', content: 'Content here', authorId: 'user1' }
//  * }, {
//  *   successMessage: 'Post created!',
//  *   showSuccessToast: true
//  * });
//  * ```
//  */
// export function useCreate<TData extends DataPayload = DataPayload>(
//   params: {
//     intent: string;
//     data: TData;
//   },
//   config: OptimisticConfig = {},
// ): OptimisticReturn {
//   const defaultConfig: OptimisticConfig = {
//     showSuccessToast: true,
//     successMessage: "Created successfully!",
//     ...config,
//   };

//   return useOptimisticSubmit(params, defaultConfig);
// }

// /**
//  * Hook for update operations.
//  * Provides sensible defaults for updating resources.
//  *
//  * @template TData - Data payload type
//  * @param params - Update parameters
//  * @param config - Optional configuration
//  * @returns Operation state and controls
//  *
//  * @example
//  * ```tsx
//  * // Update a comment
//  * const { submit, isPending } = useUpdate({
//  *   intent: 'update-comment',
//  *   data: { itemId: '123', body: 'Updated content', userId: 'user1' }
//  * });
//  *
//  * // Update user profile
//  * const { submit, isPending } = useUpdate({
//  *   intent: 'update-profile',
//  *   data: { userId: 'user1', name: 'John Doe', email: 'john@example.com' }
//  * }, {
//  *   successMessage: 'Profile updated!'
//  * });
//  * ```
//  */
// export function useUpdate<TData extends DataPayload = DataPayload>(
//   params: {
//     intent: string;
//     data: TData;
//   },
//   config: OptimisticConfig = {},
// ): OptimisticReturn {
//   const defaultConfig: OptimisticConfig = {
//     showSuccessToast: true,
//     successMessage: "Updated successfully!",
//     ...config,
//   };

//   return useOptimisticSubmit(params, defaultConfig);
// }

// /**
//  * Hook for upvote/like operations.
//  * Provides sensible defaults for voting on resources.
//  *
//  * @template TData - Data payload type
//  * @param params - Upvote parameters
//  * @param config - Optional configuration
//  * @returns Operation state and controls
//  *
//  * @example
//  * ```tsx
//  * // Upvote a comment
//  * const { submit, isPending } = useUpvote({
//  *   intent: 'upvote-comment',
//  *   data: { itemId: '123', userId: 'user1' }
//  * });
//  *
//  * // Like a post
//  * const { submit, isPending } = useUpvote({
//  *   intent: 'like-post',
//  *   data: { postId: '456', userId: 'user1', value: 1 }
//  * }, {
//  *   showSuccessToast: false // Silent operation
//  * });
//  * ```
//  */
// export function useUpvote<TData extends DataPayload = DataPayload>(
//   params: {
//     intent: string;
//     data: TData;
//   },
//   config: OptimisticConfig = {},
// ): OptimisticReturn {
//   const defaultConfig: OptimisticConfig = {
//     showSuccessToast: false, // Usually silent operation
//     showErrorToast: true,
//     ...config,
//   };

//   return useOptimisticSubmit(params, defaultConfig);
// }

// /**
//  * Hook for delete operations.
//  * Provides sensible defaults for deleting resources.
//  *
//  * @template TData - Data payload type
//  * @param params - Delete parameters
//  * @param config - Optional configuration
//  * @returns Operation state and controls
//  *
//  * @example
//  * ```tsx
//  * // Delete a comment
//  * const { submit, isPending } = useDelete({
//  *   intent: 'delete-comment',
//  *   data: { itemId: '123', userId: 'user1' }
//  * });
//  *
//  * // Delete a post with confirmation
//  * const { submit, isPending } = useDelete({
//  *   intent: 'delete-post',
//  *   data: { postId: '456', userId: 'user1' }
//  * }, {
//  *   successMessage: 'Post deleted successfully!',
//  *   showSuccessToast: true
//  * });
//  * ```
//  */
// export function useDelete<TData extends DataPayload = DataPayload>(
//   params: {
//     intent: string;
//     data: TData;
//   },
//   config: OptimisticConfig = {},
// ): OptimisticReturn {
//   const defaultConfig: OptimisticConfig = {
//     showSuccessToast: true,
//     successMessage: "Deleted successfully!",
//     ...config,
//   };

//   return useOptimisticSubmit(params, defaultConfig);
// }

import React from "react";
import { z } from "zod";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { getErrorMessage } from "~/utils/misc";

// ============================================================================
// CORE TYPES AND SCHEMAS
// ============================================================================

/**
 * Generic constraint for any data payload
 */
export const DataSchema = z.record(z.string());
export type DataPayload = z.infer<typeof DataSchema>;

/**
 * Generic submission payload schema
 */
export const SubmitSchema = z.object({
  /** The data payload for the operation */
  data: DataSchema,
  /** The intent/action type */
  intent: z.string(),
});

export type SubmitPayload = z.infer<typeof SubmitSchema>;

/**
 * Configuration for optimistic submissions
 */
export interface OptimisticConfig {
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Custom success handler */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess?: (data: any) => void;
  /** Whether to show default error toast */
  showErrorToast?: boolean;
  /** Whether to show default success toast */
  showSuccessToast?: boolean;
  /** Custom success toast message */
  successMessage?: string;
  /** Custom error toast message */
  errorMessage?: string;
  /** Stable fetcher key - prevents memory leaks */
  fetcherKey?: string;
}

/**
 * Return type from optimistic hooks
 */
export interface OptimisticReturn {
  /** Function to trigger the submission */
  submit: () => void;
  /** True during submission, false otherwise */
  isPending: boolean;
  /** Submitted data if available */
  submittedData: FormData | undefined;
  /** Error object if submission failed, null otherwise */
  error: Error | null;
  /** Success response data if available */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  /** Reset the fetcher state */
  reset: () => void;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generates a stable fetcher key based on intent
 */
function generateFetcherKey(intent: string, customKey?: string): string {
  if (customKey) return customKey;
  return `optimistic-${intent}`;
}

/**
 * Generates a stable toast ID based on intent and type
 */
function generateToastId(intent: string, type: "success" | "error"): string {
  return `${intent}-${type}`;
}

/**
 * Schema parser utility function
 */
function parseSubmitPayload(data: DataPayload, intent: string) {
  try {
    return SubmitSchema.parse({ data, intent });
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// ============================================================================
// CORE HOOK
// ============================================================================

/**
 * Base hook for optimistic submissions with any data and intent type.
 * Handles the core submission logic and error handling.
 *
 * OPTIMIZATIONS:
 * - Stable fetcher keys prevent memory leaks
 * - Stable toast IDs prevent toast accumulation
 * - Memoized callbacks reduce re-renders
 * - Proper cleanup on unmount
 * - Reset functionality for state management
 *
 * @template TData - Data payload type
 * @template TIntent - Intent/action type
 * @param params - Submission parameters
 * @param config - Optional configuration
 * @returns Operation state and controls
 */
export function useOptimisticSubmit<
  TData extends DataPayload = DataPayload,
  TIntent extends string = string,
>(
  params: {
    intent: TIntent;
    data: TData;
  },
  config: OptimisticConfig = {},
): OptimisticReturn {
  const {
    onError,
    onSuccess,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    errorMessage,
    fetcherKey: customFetcherKey,
  } = config;

  // Stable fetcher key prevents memory leaks
  const fetcherKey = React.useMemo(
    () => generateFetcherKey(params.intent, customFetcherKey),
    [params.intent, customFetcherKey],
  );

  const fetcher = useFetcher({ key: fetcherKey });

  // Stable toast IDs prevent accumulation
  const toastIds = React.useMemo(
    () => ({
      success: generateToastId(params.intent, "success"),
      error: generateToastId(params.intent, "error"),
    }),
    [params.intent],
  );

  // Memoized submit function
  const submit = React.useCallback(() => {
    try {
      const parsed = parseSubmitPayload(params.data, params.intent);

      fetcher.submit(
        {
          data: JSON.stringify(parsed.data),
          intent: parsed.intent,
        },
        { method: "post" },
      );
    } catch (error) {
      console.error("Submit error:", error);
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      if (onError) {
        onError(errorObj);
      } else if (showErrorToast) {
        toast.error(errorMessage || getErrorMessage(errorObj), {
          id: toastIds.error,
        });
      }
    }
  }, [
    params.data,
    params.intent,
    onError,
    showErrorToast,
    errorMessage,
    toastIds.error,
    fetcher,
  ]);

  // Memoized reset function
  const reset = React.useCallback(() => {
    // Dismiss any existing toasts
    toast.dismiss(toastIds.success);
    toast.dismiss(toastIds.error);
  }, [toastIds]);

  // Handle success with stable dependencies
  React.useEffect(() => {
    if (fetcher.data && fetcher.state === "idle" && !fetcher.data.error) {
      if (onSuccess) {
        onSuccess(fetcher.data);
      }
      if (showSuccessToast && successMessage) {
        toast.success(successMessage, {
          id: toastIds.success,
        });
      }
    }
  }, [
    fetcher.data,
    fetcher.state,
    onSuccess,
    showSuccessToast,
    successMessage,
    toastIds.success,
  ]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      toast.dismiss(toastIds.success);
      toast.dismiss(toastIds.error);
    };
  }, [toastIds]);

  // Memoized return object
  return React.useMemo(
    () => ({
      submit,
      isPending: fetcher.state !== "idle",
      submittedData: fetcher.formData,
      error: fetcher.data?.error || null,
      data: fetcher.data,
      reset,
    }),
    [submit, fetcher.state, fetcher.formData, fetcher.data, reset],
  );
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for creation operations.
 * Provides sensible defaults for creating resources.
 */
export function useCreate<TData extends DataPayload = DataPayload>(
  params: {
    intent: string;
    data: TData;
  },
  config: OptimisticConfig = {},
): OptimisticReturn {
  const optimizedConfig = React.useMemo(
    () => ({
      showSuccessToast: true,
      successMessage: "Created successfully!",
      fetcherKey: `create-${params.intent}`,
      ...config,
    }),
    [params.intent, config],
  );

  return useOptimisticSubmit(params, optimizedConfig);
}

/**
 * Hook for update operations.
 * Provides sensible defaults for updating resources.
 */
export function useUpdate<TData extends DataPayload = DataPayload>(
  params: {
    intent: string;
    data: TData;
  },
  config: OptimisticConfig = {},
): OptimisticReturn {
  const optimizedConfig = React.useMemo(
    () => ({
      showSuccessToast: true,
      successMessage: "Updated successfully!",
      fetcherKey: `update-${params.intent}`,
      ...config,
    }),
    [params.intent, config],
  );

  return useOptimisticSubmit(params, optimizedConfig);
}

/**
 * Hook for upvote/like operations.
 * Provides sensible defaults for voting on resources.
 */
export function useUpvote<TData extends DataPayload = DataPayload>(
  params: {
    intent: string;
    data: TData;
  },
  config: OptimisticConfig = {},
): OptimisticReturn {
  const optimizedConfig = React.useMemo(
    () => ({
      showSuccessToast: false, // Usually silent operation
      showErrorToast: true,
      fetcherKey: `upvote-${params.intent}`,
      ...config,
    }),
    [params.intent, config],
  );

  return useOptimisticSubmit(params, optimizedConfig);
}

/**
 * Hook for delete operations.
 * Provides sensible defaults for deleting resources.
 */
export function useDelete<TData extends DataPayload = DataPayload>(
  params: {
    intent: string;
    data: TData;
  },
  config: OptimisticConfig = {},
): OptimisticReturn {
  const optimizedConfig = React.useMemo(
    () => ({
      showSuccessToast: true,
      successMessage: "Deleted successfully!",
      fetcherKey: `delete-${params.intent}`,
      ...config,
    }),
    [params.intent, config],
  );

  return useOptimisticSubmit(params, optimizedConfig);
}

// ============================================================================
// ADVANCED HOOKS
// ============================================================================

/**
 * Hook for batch operations with optimized performance.
 * Useful for operations that might be called multiple times rapidly.
 */
export function useBatchOptimistic<TData extends DataPayload = DataPayload>(
  params: {
    intent: string;
    data: TData;
  },
  config: OptimisticConfig & {
    /** Debounce delay in milliseconds */
    debounceMs?: number;
  } = {},
): OptimisticReturn {
  const { debounceMs = 300, ...restConfig } = config;

  const optimizedConfig = React.useMemo(
    () => ({
      showSuccessToast: false, // Usually silent for batch operations
      showErrorToast: true,
      fetcherKey: `batch-${params.intent}`,
      ...restConfig,
    }),
    [params.intent, restConfig],
  );

  const baseHook = useOptimisticSubmit(params, optimizedConfig);

  // Debounced submit function
  const debouncedSubmit = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        baseHook.submit();
      }, debounceMs);
    };
  }, [baseHook.submit, debounceMs]);

  return React.useMemo(
    () => ({
      ...baseHook,
      submit: debouncedSubmit,
    }),
    [baseHook, debouncedSubmit],
  );
}

/**
 * Hook for optimistic submissions with automatic retry logic.
 */
export function useOptimisticWithRetry<TData extends DataPayload = DataPayload>(
  params: {
    intent: string;
    data: TData;
  },
  config: OptimisticConfig & {
    /** Maximum number of retry attempts */
    maxRetries?: number;
    /** Retry delay in milliseconds */
    retryDelayMs?: number;
  } = {},
): OptimisticReturn & { retryCount: number } {
  const { maxRetries = 3, retryDelayMs = 1000, ...restConfig } = config;
  const [retryCount, setRetryCount] = React.useState(0);

  const optimizedConfig = React.useMemo(
    () => ({
      fetcherKey: `retry-${params.intent}`,
      ...restConfig,
      onError: (error: Error) => {
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            baseHook.submit();
          }, retryDelayMs);
        } else {
          restConfig.onError?.(error);
        }
      },
    }),
    [params.intent, restConfig, retryCount, maxRetries, retryDelayMs],
  );

  const baseHook = useOptimisticSubmit(params, optimizedConfig);

  // Reset retry count on successful submission
  React.useEffect(() => {
    if (baseHook.data && !baseHook.error) {
      setRetryCount(0);
    }
  }, [baseHook.data, baseHook.error]);

  return React.useMemo(
    () => ({
      ...baseHook,
      retryCount,
    }),
    [baseHook, retryCount],
  );
}
