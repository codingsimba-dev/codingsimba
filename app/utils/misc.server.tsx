import TurndownService from "turndown";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Validates and sanitizes component code for security
 * @param code - The component code to validate
 * @returns {boolean} Whether the code is safe to execute
 */
function validateComponentCode(code: string): boolean {
  // Block dangerous patterns
  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /setTimeout\s*\([^,]*,\s*[^)]*\)/,
    /setInterval\s*\([^,]*,\s*[^)]*\)/,
    /fetch\s*\(/,
    /XMLHttpRequest/,
    /localStorage/,
    /sessionStorage/,
    /document\.cookie/,
    /window\./,
    /process\./,
    /require\s*\(/,
    /import\s*\(/,
    /__dirname/,
    /__filename/,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(code));
}

/**
 * Sanitizes component code by removing potentially dangerous code
 * @param code - The component code to sanitize
 * @returns {string} Sanitized code
 */
function sanitizeComponentCode(code: string): string {
  // Remove any eval-like patterns
  return code
    .replace(/eval\s*\([^)]*\)/g, "// eval() removed for security")
    .replace(/Function\s*\([^)]*\)/g, "// Function() removed for security")
    .replace(
      /setTimeout\s*\([^,]*,\s*[^)]*\)/g,
      "// setTimeout() removed for security",
    )
    .replace(
      /setInterval\s*\([^,]*,\s*[^)]*\)/g,
      "// setInterval() removed for security",
    );
}

/**
 * Bundles React components into a format suitable for MDX bundling.
 * Transforms an array of component objects into a record of file paths and their code content.
 * Includes security validation and sanitization.
 *
 * @param {Array<{ file: { filename: string; code: string } }>} components - Array of component objects
 * @returns {Record<string, string>} Object mapping file paths to their code content
 *
 * @example
 * ```ts
 * const components = [
 *   { file: { filename: "Button", code: "export const Button = () => <button>Click me</button>" } }
 * ];
 * const bundled = bundleComponents(components);
 * // Result: { "./Button.tsx": "export const WrappedButton = (props) => ..." }
 * ```
 */
export function bundleComponents(
  components: Array<{ file: { filename: string; code: string } }>,
): Record<string, string> {
  if (!components?.length) {
    return {};
  }

  return components.reduce<Record<string, string>>((acc, component) => {
    const componentName = component.file.filename
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    const fileKey = `./${component.file.filename}.tsx`;

    // Security validation
    if (!validateComponentCode(component.file.code)) {
      console.warn(
        `Component ${componentName} contains potentially dangerous code and will be skipped`,
      );
      return acc;
    }

    // Sanitize the code
    const sanitizedCode = sanitizeComponentCode(component.file.code);

    acc[fileKey] = `
    import React, { useState } from 'react';
    ${sanitizedCode}
    export default function Embedded(props) {
      return (
        <div className="mdx-embedded-wrapper">
            <${componentName} {...props} />
        </div>
      );
    }
    `;
    return acc;
  }, {});
}

const turndownService = new TurndownService({
  headingStyle: "atx", // Use # for headings
  bulletListMarker: "-", // Use - for lists
  codeBlockStyle: "fenced", // Use ``` for code blocks
});

marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
});

/**
 * Service for converting between Markdown and HTML formats.
 * Uses marked for Markdown to HTML conversion and Turndown for HTML to Markdown conversion.
 * Includes sanitization of input using DOMPurify.
 */
export class MarkdownConverter {
  /**
   * Converts Markdown to sanitized HTML.
   * @param markdown - The Markdown string to convert
   * @returns Promise<string> - The sanitized HTML output
   * @example
   * ```ts
   * const html = await MarkdownConverter.toHtml("# Hello World");
   * // Returns: "<h1>Hello World</h1>"
   * ```
   */
  static async toHtml(markdown: string) {
    return marked.parse(DOMPurify.sanitize(markdown));
  }

  /**
   * Converts HTML to Markdown format.
   * @param html - The HTML string to convert
   * @returns string - The Markdown output
   * @example
   * ```ts
   * const markdown = MarkdownConverter.toMarkdown("<h1>Hello World</h1>");
   * // Returns: "# Hello World"
   * ```
   */
  static toMarkdown(html: string) {
    return turndownService.turndown(html);
  }
}

/**
 * Execute an operation with retry logic
 * @param operation - The operation to retry
 * @param operationName - Name of the operation for logging
 * @param options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param options.retryDelays - Array of delay times in milliseconds between retries (default: [1000, 5000, 15000])
 * @returns Promise<T> - Result of the operation
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => fetchData(),
 *   "fetch_data",
 *   {
 *     maxRetries: 3,
 *     retryDelays: [1000, 5000, 15000, 30000, 60000]
 *   }
 * );
 * ```
 */

export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: {
    maxRetries?: number;
    retryDelays?: number[];
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelays = [6e4, 6e5, 18e5, 36e5, 43e5, 864e5, 1728e5], // [one minute, ten minutes, thirty minutes, one hour, twelve hours, one day, two days]
  } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
      console.warn(
        `Retrying ${operationName}, attempt ${attempt + 1}/${maxRetries + 1}`,
      );
    }
  }
  throw lastError;
}
