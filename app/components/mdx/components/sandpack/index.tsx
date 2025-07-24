import React from "react";
import { Theme, useTheme } from "remix-themes";
import type { SandpackTemplate } from "~/utils/content.server/articles/types";
import {
  SandpackProvider,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import { SandpackFileExplorer } from "sandpack-file-explorer";
import { atomDark, ecoLight } from "@codesandbox/sandpack-themes";
import { Code, Maximize, Minimize } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useMobile } from "~/hooks/use-mobile";
import { cn } from "~/utils/misc";
import {
  CopyCode,
  SandpackTabs,
  StatusIndicator,
  type ViewProps,
} from "./sandpack-components";
import { Preview } from "./preview";
import { toast } from "sonner";
import { getErrorMessage } from "~/utils/misc";

/**
 * Template mapping for different Sandpack templates
 */
const TEMPLATE_MAP = {
  static: "HTML/CSS/JS",
  vanilla: "javascript",
  "vanilla-ts": "typescript",
  "vite-react": "react",
  "vite-react-ts": "react",
  node: "Node.js",
} as const;

/**
 * Custom setup mapping for dependencies
 */
const CUSTOM_SETUP_MAP = {
  dependencies: "dependencies",
  devDependencies: "devDependencies",
} as const;

/**
 * Props for the Sandpack component
 */
interface SandpackProps {
  /** The Sandpack template configuration */
  sandpackTemplate: SandpackTemplate;
}

/**
 * Main Sandpack component that provides a code editor, preview, and file explorer
 * @param {SandpackProps} props - Component props
 * @returns {JSX.Element} Sandpack component
 */
export function Sandpack({ sandpackTemplate }: SandpackProps) {
  const [theme] = useTheme();
  const isMobile = useMobile();
  const [activeView, setActiveView] = React.useState<ViewProps>(
    sandpackTemplate?.options?.view ?? "split",
  );
  const [showConsole, setShowConsole] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const sandpackRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const templateLabel = TEMPLATE_MAP[sandpackTemplate.template];
  const options = { ...sandpackTemplate.options };
  const isDarkMode = theme === Theme.DARK;

  const refinedTheme =
    options.theme === "auto"
      ? isDarkMode
        ? atomDark
        : ecoLight
      : options.theme === "light"
        ? ecoLight
        : atomDark;

  const handleFullscreenChange = React.useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  React.useEffect(() => {
    if (isMobile && activeView === "split") {
      setActiveView("preview");
    }
  }, [isMobile, activeView]);

  React.useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = React.useCallback(() => {
    if (!isFullscreen && sandpackRef.current) {
      sandpackRef.current.requestFullscreen().catch((err) => {
        toast.error(getErrorMessage(err));
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        toast.error(getErrorMessage(err));
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  }, [isFullscreen]);

  const showPreview =
    activeView === "preview" || (activeView === "split" && !isMobile);

  const showEditor = React.useMemo(
    () => activeView === "editor" || (activeView === "split" && !isMobile),
    [activeView, isMobile],
  );

  const shouldShowFileExplorer =
    options.view !== "preview" && activeView !== "preview";
  const shouldShowEditor =
    options.view !== "preview" && activeView !== "preview";
  const shouldShowTabs = options.view !== "preview";

  const refinedFiles = React.useMemo(() => {
    const files = sandpackTemplate.sandpackFiles || [];
    return files?.length
      ? Object.fromEntries(files.map((file) => [file.path, file]))
      : undefined;
  }, [sandpackTemplate.sandpackFiles]);

  const refinedCustomSetup = React.useMemo(
    () => (setupType: keyof typeof CUSTOM_SETUP_MAP) => {
      const setup = sandpackTemplate?.customSetup?.[setupType];
      return setup?.reduce(
        (acc, dep) => ({ ...acc, [dep.name]: dep.version }),
        {},
      );
    },
    [sandpackTemplate?.customSetup],
  );

  const containerClassName = cn(
    "overflow-hidden bg-muted transition-all duration-300",
    isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "",
  );

  const headerClassName = cn(
    "flex items-center justify-between border-b px-2 py-1",
    {
      "h-full": isFullscreen,
    },
  );

  const fileExplorerClassName = cn(
    "!h-full !min-h-full border-r",
    isMobile
      ? "w-[150px] min-w-[100px] max-w-[150px]"
      : "w-[200px] min-w-[150px] max-w-[200px]",
  );

  return (
    <div ref={sandpackRef} className={containerClassName}>
      <SandpackProvider
        theme={refinedTheme}
        template={sandpackTemplate.template}
        files={refinedFiles}
        options={{
          autorun: options.autorun,
          recompileMode: "delayed",
          recompileDelay: 300,
          classes: {
            "sp-wrapper": "sandpack-wrapper",
            "sp-preview": "sandpack-preview",
            "sp-console": "sandpack-console",
            "sp-editor": "sandpack-editor",
          },
        }}
        customSetup={{
          dependencies: refinedCustomSetup(CUSTOM_SETUP_MAP.dependencies),
          devDependencies: refinedCustomSetup(CUSTOM_SETUP_MAP.devDependencies),
        }}
      >
        <div className={headerClassName}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium">
              <Code className="size-4" />
              <span className="capitalize">{templateLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {shouldShowTabs && (
              <SandpackTabs
                activeView={activeView}
                setActiveView={setActiveView}
                isMobile={isMobile}
              />
            )}
            <Button
              onClick={toggleFullscreen}
              size="icon"
              className="ml-4 size-7"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </Button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex h-full"
          style={{
            height: isFullscreen ? "calc(100vh - 80px)" : options.editorHeight,
          }}
        >
          {shouldShowFileExplorer && (
            <div className={fileExplorerClassName}>
              <SandpackFileExplorer className="sandpack-file-explorer" />
            </div>
          )}

          <div className="relative flex h-full flex-1">
            {showEditor && showPreview && activeView === "split" ? (
              <>
                <div className="h-full w-1/2 overflow-hidden">
                  <SandpackCodeEditor
                    showLineNumbers={options.showLineNumbers}
                    showInlineErrors={options.showInlineErrors}
                    showTabs={options.showTabs}
                    wrapContent
                    className="h-full w-full rounded-none border-none"
                  />
                </div>

                <div className="h-full w-1/2 overflow-hidden border-l">
                  <Preview
                    showConsole={showConsole}
                    setShowConsole={setShowConsole}
                  />
                </div>
              </>
            ) : (
              <div className="h-full w-full">
                {shouldShowEditor && !showPreview && (
                  <SandpackCodeEditor
                    showLineNumbers={options.showLineNumbers}
                    showInlineErrors={options.showInlineErrors}
                    showTabs={options.showTabs}
                    wrapContent
                    className="h-full w-full rounded-none border-none"
                  />
                )}

                {showPreview && !shouldShowEditor && (
                  <Preview
                    showConsole={showConsole}
                    setShowConsole={setShowConsole}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between border-t px-2 py-2 text-xs">
          <StatusIndicator />
          {activeView === "editor" || activeView === "split" ? (
            <CopyCode />
          ) : null}
        </div>
      </SandpackProvider>
    </div>
  );
}
