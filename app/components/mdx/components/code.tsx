import React from "react";
import ShikiHighlighter, { type Element } from "react-shiki";
import { transformerNotationDiff } from "@shikijs/transformers";
import type { SandpackTemplate } from "~/utils/content.server/articles/types";
import { Check, Codesandbox, Copy, Youtube } from "lucide-react";
import { useTheme } from "remix-themes";
import { cn } from "~/utils/misc";
import { Sandpack } from "./sandpack";
import { Iframe } from "./media";
import { EmptyState } from "~/components/empty-state";
import { Mermaid } from "./mermaid";

/**
 * Available theme options for code highlighting
 */
const THEMES = {
  light: "one-light",
  dark: "night-owl",
} as const;

/**
 * Props for the Code component
 */
interface CodeHighlightProps {
  /** Additional CSS class names */
  className?: string;
  /** Child elements or content */
  children?: React.ReactNode;
  /** Shiki element node */
  node?: Element;
  /** Array of Sandpack templates */
  sandpackTemplates?: SandpackTemplate[];
  /** Whether the code is inline */
  inline: boolean;
}

function InvalidSandboxTemplate() {
  return (
    <EmptyState
      icon={<Codesandbox size={30} className="animate-spin text-red-500" />}
      title="Invalid sandbox template"
      className="bg-red-300/60 dark:bg-red-950"
    />
  );
}

/**
 * Props for the CopyButton component
 */
interface CopyButtonProps {
  /** Code content to be copied */
  code: string;
}

/**
 * Button component for copying code to clipboard
 * @param {CopyButtonProps} props - Component props
 * @returns {JSX.Element} Copy button with success state
 */
const CopyButton = React.memo(function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = React.useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    });
  }, [code]);

  return (
    <button
      onClick={copyToClipboard}
      className="bg-muted/80 text-destructive hover:bg-muted absolute right-2 top-2 z-10 rounded-md p-2 transition-colors"
      aria-label="Copy code"
      disabled={copied}
    >
      {copied ? (
        <Check size={16} className="text-blue-600" />
      ) : (
        <Copy size={16} className="text-muted-foreground" />
      )}
    </button>
  );
});

/**
 * Main Code component that handles code highlighting, Sandpack integration, and iframe embedding
 * @param {CodeHighlightProps} props - Component props
 * @returns {JSX.Element} Code component with appropriate rendering based on content type
 */
export function Code({
  inline,
  className,
  children,
  sandpackTemplates,
  ...props
}: CodeHighlightProps): React.ReactElement {
  const [mounted, setMounted] = React.useState(false);
  const [theme] = useTheme();
  const isDark = theme === "dark";
  const currentTheme = isDark ? THEMES.dark : THEMES.light;

  const match = className?.match(/language-(\w+)/);
  const language = match?.[1]?.toLowerCase();

  // Content type detection
  const isMermaid = language?.startsWith("mermaid");
  const isYoutube = language?.startsWith("youtube") ?? null;
  const isBunny = language?.startsWith("bunny") ?? null;
  const isValidLanguage = !!isYoutube || !!isBunny;

  const isSandpack = !!(language?.startsWith("sandpack") ?? null);

  // Code content processing
  const isInline = inline || !language;
  const code = children
    ? typeof children === "string"
      ? children.trim()
      : String(children).trim()
    : "";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span />;
  }

  if (isMermaid) {
    const chart = code;
    return chart ? <Mermaid chart={chart} /> : <span />;
  }

  // Handle iframe content

  if (isValidLanguage) {
    const videoId = code || null;
    if (!videoId) {
      return (
        <EmptyState
          icon={<Youtube size={30} className="animate-pulse text-red-500" />}
          title="Invalid YouTube ID"
          className="bg-red-300/60 dark:bg-red-950"
        />
      );
    }
    return <Iframe videoId={code} type={isYoutube ? "youtube" : "bunny"} />;
  }

  // Handle Sandpack content
  if (isSandpack) {
    const templateSlug = code || null;
    const isTemplates =
      templateSlug && sandpackTemplates && sandpackTemplates?.length;

    if (!isTemplates) {
      return <InvalidSandboxTemplate />;
    }

    const template = sandpackTemplates.find(
      (template) => template.slug === templateSlug,
    );

    if (!template) {
      return <InvalidSandboxTemplate />;
    }

    return <Sandpack sandpackTemplate={template} />;
  }

  // Handle regular code blocks
  return !isInline ? (
    <div className={cn("relative text-sm", className)}>
      <CopyButton code={code} />
      <ShikiHighlighter
        transformers={[transformerNotationDiff({ matchAlgorithm: "v3" })]}
        language={language}
        theme={currentTheme}
        langClassName="left-2 !top-[3px] capitalize"
        delay={150}
        {...props}
      >
        {code}
      </ShikiHighlighter>
    </div>
  ) : (
    <span
      className={cn(
        "bg-muted inline rounded px-1 py-0.5 font-mono text-sm",
        "text-foreground",
        className,
      )}
      {...props}
    >
      {code}
    </span>
  );
}
