import React from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import {
  Check,
  Code,
  Copy,
  Eye,
  Layout,
  Play,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/utils/misc";

/**
 * Available view modes for the Sandpack editor
 */
export type ViewProps = "editor" | "preview" | "split";

/**
 * Props for the SandpackTabs component
 */
interface SandpackTabsProps {
  /** Current active view */
  activeView: ViewProps;
  /** Function to change the active view */
  setActiveView: (view: ViewProps) => void;
  /** Whether the component is being rendered on a mobile device */
  isMobile?: boolean;
}

/**
 * Tabs component for switching between editor, split, and preview views
 * @param {SandpackTabsProps} props - Component props
 * @returns {JSX.Element} Tabs component
 */
export function SandpackTabs({
  activeView,
  setActiveView,
  isMobile = false,
}: SandpackTabsProps) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as ViewProps)}
        className="h-7"
      >
        <TabsList className="bg-muted h-7 p-1">
          <TabsTrigger
            value="editor"
            className="h-7 rounded-md px-3 text-xs font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-white"
          >
            <Code className="mr-1.5 size-3.5" />
            Editor
          </TabsTrigger>
          {!isMobile && (
            <TabsTrigger
              value="split"
              className="h-7 rounded-md px-3 text-xs font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-white"
            >
              <Layout className="mr-1.5 size-3.5" />
              Split
            </TabsTrigger>
          )}
          <TabsTrigger
            value="preview"
            className="h-7 rounded-md px-3 text-xs font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-white"
          >
            <Eye className="mr-1.5 size-3.5" />
            Preview
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

/**
 * Button component for running the Sandpack code
 * @returns {JSX.Element} Run button with tooltip
 */
export function RunButton() {
  const { sandpack } = useSandpack();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="h-6 rounded-md bg-violet-500 text-xs text-white hover:bg-violet-600"
            onClick={() => sandpack.runSandpack()}
            disabled={sandpack.status === "running"}
          >
            <Play className="mr-1 size-3" />
            Run
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Run code</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Button component for resetting all files in the Sandpack editor
 * @returns {JSX.Element} Reset button with tooltip
 */
export function RefreshButton() {
  const { sandpack } = useSandpack();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-md"
            onClick={() => sandpack.resetAllFiles()}
            aria-label="Reset files"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Reset files</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Button component for copying the current file's code to clipboard
 * @returns {JSX.Element} Copy button with success state
 */
export function CopyCode() {
  const { sandpack } = useSandpack();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = React.useCallback(() => {
    const activeFileContent = sandpack.files[sandpack.activeFile]?.code || "";
    navigator.clipboard.writeText(activeFileContent).then(() => {
      setCopied(true);
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    });
  }, [sandpack.files, sandpack.activeFile]);

  return (
    <Button
      onClick={copyToClipboard}
      variant="ghost"
      size="sm"
      className="h-6 rounded-md px-2 text-xs"
    >
      {copied ? (
        <>
          <Check className="text-blue-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="text-muted-foreground" />
          Copy Code
        </>
      )}
    </Button>
  );
}

/**
 * Props for the ShowConsole component
 */
interface ShowConsoleProps {
  /** Whether the console is currently visible */
  showConsole: boolean;
  /** Function to toggle console visibility */
  setShowConsole: (showConsole: boolean) => void;
}

/**
 * Button component for toggling the console visibility
 * @param {ShowConsoleProps} props - Component props
 * @returns {JSX.Element} Console toggle button
 */
export function ShowConsole({ showConsole, setShowConsole }: ShowConsoleProps) {
  const toggleConsole = React.useCallback(() => {
    setShowConsole(!showConsole);
  }, [showConsole, setShowConsole]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 rounded-md px-3 text-xs"
      onClick={toggleConsole}
    >
      <Terminal className="mr-1 size-3.5" />
      Console
    </Button>
  );
}

/**
 * Component for displaying the current status of the Sandpack editor
 * @returns {JSX.Element} Status indicator with color and text
 */
export function StatusIndicator() {
  const { sandpack } = useSandpack();
  const [status, setStatus] = React.useState({
    color: "bg-amber-500",
    text: "Initializing...",
  });

  React.useEffect(() => {
    const statusMap: Record<string, { color: string; text: string }> = {
      idle: { color: "bg-emerald-500", text: "Ready" },
      error: { color: "bg-red-500", text: "Error" },
      timeout: { color: "bg-red-500", text: "Timeout" },
      running: { color: "bg-blue-500", text: "Running" },
      initial: { color: "bg-amber-500", text: "Initializing..." },
    };

    setStatus(
      statusMap[sandpack.status] || { color: "bg-muted", text: "Unknown" },
    );
  }, [sandpack.status]);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <div className={cn("size-2 rounded-full", status.color)} />
      <span>{status.text}</span>
    </div>
  );
}
