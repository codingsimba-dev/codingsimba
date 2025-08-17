import type { ProfilerOnRenderCallback } from "react";

// Type definitions
interface DevProfilerOptions {
  logThreshold?: number;
  warnThreshold?: number;
  errorThreshold?: number;
  showStackTrace?: boolean;
  trackRerenders?: boolean;
  colorizedLogs?: boolean;
  showMemoryUsage?: boolean;
  groupLogs?: boolean;
  trackInteractions?: boolean;
  visualIndicators?: boolean;
  componentWhitelist?: string[] | null;
  componentBlacklist?: string[] | null;
}

interface ComponentStats {
  totalRenders: number;
  totalDuration: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  mountCount: number;
  updateCount: number;
  lastRender: number;
}

interface MemoryInfo {
  used: number;
  allocated: number;
  limit: number;
}

interface RerenderInfo {
  recentRenderCount: number;
  timeSinceLastRender: number | null;
  isRapidRerender: boolean;
}

interface InteractionData {
  name: string;
  timestamp: number;
  totalOccurrences: number;
}

interface InteractionHistory {
  name: string;
  timestamp: number;
  count: number;
}

type LogSeverity = "info" | "warn" | "error";
type LogMethod = "log" | "warn" | "error";

// Extend Performance interface to include memory property
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

// Enhanced development profiler callback with comprehensive debugging features
const createDevProfilerCallback = (
  options: DevProfilerOptions = {},
): ProfilerOnRenderCallback => {
  const {
    logThreshold = 1,
    warnThreshold = 16,
    errorThreshold = 50,
    showStackTrace = false,
    trackRerenders = true,
    colorizedLogs = true,
    showMemoryUsage = true,
    groupLogs = true,
    trackInteractions = true,
    visualIndicators = true,
    componentWhitelist = null,
    componentBlacklist = null,
  } = options;

  // Performance tracking state
  const renderHistory = new Map<string, number[]>();
  const interactionHistory = new Map<number, InteractionHistory>();
  const componentStats = new Map<string, ComponentStats>();

  // Visual indicator styles (injected once)
  if (visualIndicators && !document.querySelector("#profiler-styles")) {
    const styles = document.createElement("style");
    styles.id = "profiler-styles";
    styles.textContent = `
      .profiler-highlight-slow { 
        animation: profiler-pulse-red 0.8s ease-in-out; 
        box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.5) !important;
      }
      .profiler-highlight-warn { 
        animation: profiler-pulse-yellow 0.8s ease-in-out; 
        box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.5) !important;
      }
      @keyframes profiler-pulse-red {
        0%, 100% { box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.5); }
        50% { box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.2); }
      }
      @keyframes profiler-pulse-yellow {
        0%, 100% { box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.5); }
        50% { box-shadow: 0 0 0 4px rgba(255, 165, 0, 0.2); }
      }
    `;
    document.head.appendChild(styles);
  }

  // Helper functions
  const getColorForDuration = (duration: number): string => {
    if (!colorizedLogs) return "";
    if (duration >= errorThreshold) return "color: #ff4444; font-weight: bold;";
    if (duration >= warnThreshold) return "color: #ff8800; font-weight: bold;";
    if (duration >= logThreshold) return "color: #4488ff;";
    return "color: #888888;";
  };

  const formatDuration = (duration: number): string => {
    return `${duration.toFixed(2)}ms`;
  };

  const getMemoryInfo = (): MemoryInfo | null => {
    if (!showMemoryUsage || !performance.memory) return null;
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      allocated: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
    };
  };

  const updateComponentStats = (
    id: string,
    duration: number,
    phase: "mount" | "update",
  ): void => {
    if (!componentStats.has(id)) {
      componentStats.set(id, {
        totalRenders: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
        mountCount: 0,
        updateCount: 0,
        lastRender: Date.now(),
      });
    }

    const stats = componentStats.get(id)!;
    stats.totalRenders++;
    stats.totalDuration += duration;
    stats.avgDuration = stats.totalDuration / stats.totalRenders;
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.minDuration = Math.min(stats.minDuration, duration);
    stats[`${phase}Count`]++;
    stats.lastRender = Date.now();
  };

  const trackRerender = (
    id: string,
    phase: "mount" | "update",
  ): RerenderInfo | null => {
    if (!trackRerenders || phase !== "update") return null;

    const now = Date.now();
    const history = renderHistory.get(id) || [];

    // Keep only last 10 renders for each component
    history.push(now);
    if (history.length > 10) history.shift();

    renderHistory.set(id, history);

    // Detect rapid re-renders (> 3 renders in last 1000ms)
    const recentRenders = history.filter((time) => now - time < 1000);

    return {
      recentRenderCount: recentRenders.length,
      timeSinceLastRender:
        history.length > 1 ? now - history[history.length - 2] : null,
      isRapidRerender: recentRenders.length > 3,
    };
  };

  const addVisualIndicator = (id: string, severity: "error" | "warn"): void => {
    if (!visualIndicators) return;

    // Find DOM element by component ID (approximate)
    const elements = document.querySelectorAll(`[data-profiler-id="${id}"]`);
    elements.forEach((el: Element) => {
      const element = el as HTMLElement;
      element.classList.remove(
        "profiler-highlight-slow",
        "profiler-highlight-warn",
      );
      if (severity === "error") {
        element.classList.add("profiler-highlight-slow");
      } else if (severity === "warn") {
        element.classList.add("profiler-highlight-warn");
      }

      setTimeout(() => {
        element.classList.remove(
          "profiler-highlight-slow",
          "profiler-highlight-warn",
        );
      }, 800);
    });
  };

  const processInteractions = (
    interactions: Set<{ id: number; name: string; timestamp: number }>,
  ): InteractionData[] | null => {
    if (!trackInteractions) return null;

    const interactionData: InteractionData[] = [];
    interactions.forEach((interaction) => {
      const id = interaction.id;
      if (!interactionHistory.has(id)) {
        interactionHistory.set(id, {
          name: interaction.name,
          timestamp: interaction.timestamp,
          count: 0,
        });
      }

      const existing = interactionHistory.get(id)!;
      existing.count++;

      interactionData.push({
        name: interaction.name,
        timestamp: interaction.timestamp,
        totalOccurrences: existing.count,
      });
    });

    return interactionData;
  };

  const shouldLog = (id: string, duration: number): boolean => {
    // Check whitelist/blacklist
    if (componentWhitelist && !componentWhitelist.includes(id)) return false;
    if (componentBlacklist && componentBlacklist.includes(id)) return false;

    // Check duration threshold
    return duration >= logThreshold;
  };

  // Main callback function
  return function onRenderCallback(
    id: string,
    phase: "mount" | "update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<{ id: number; name: string; timestamp: number }>,
  ): void {
    // Skip if component is filtered out or below threshold
    if (!shouldLog(id, actualDuration)) return;

    // Update component statistics
    updateComponentStats(id, actualDuration, phase);

    // Track re-renders
    const rerenderInfo = trackRerender(id, phase);

    // Process interactions
    const interactionData = processInteractions(interactions);

    // Get memory information
    const memoryInfo = getMemoryInfo();

    // Determine severity
    let severity: LogSeverity = "info";
    let logMethod: LogMethod = "log";

    if (actualDuration >= errorThreshold) {
      severity = "error";
      logMethod = "error";
      addVisualIndicator(id, "error");
    } else if (actualDuration >= warnThreshold) {
      severity = "warn";
      logMethod = "warn";
      addVisualIndicator(id, "warn");
    }

    // Calculate efficiency metrics
    const renderEfficiency =
      baseDuration > 0 ? (baseDuration / actualDuration) * 100 : 100;
    const wastedTime = Math.max(0, actualDuration - baseDuration);
    const stats = componentStats.get(id)!;

    // Build log message components
    const durationText = `${formatDuration(actualDuration)}`;
    const phaseText = phase === "mount" ? "🚀 MOUNT" : "🔄 UPDATE";
    const efficiencyText =
      renderEfficiency < 50
        ? `⚠️ ${renderEfficiency.toFixed(0)}% efficient`
        : `✅ ${renderEfficiency.toFixed(0)}% efficient`;

    if (groupLogs) {
      console.group(
        `%c${phaseText} ${id} %c${durationText}`,
        "color: #2196F3; font-weight: bold;",
        getColorForDuration(actualDuration),
      );
    }

    // Primary log message
    const primaryMessage = [
      `%c🔍 React Profiler`,
      "color: #61dafb; font-weight: bold;",
      `\n📦 Component: %c${id}`,
      "color: #2196F3; font-weight: bold;",
      `\n⏱️ Duration: %c${durationText} %c(base: ${formatDuration(baseDuration)})`,
      getColorForDuration(actualDuration),
      "color: #888;",
      `\n📊 Phase: %c${phaseText}`,
      phase === "mount" ? "color: #4CAF50;" : "color: #FF9800;",
      `\n⚡ Efficiency: %c${efficiencyText}`,
      renderEfficiency < 50 ? "color: #f44336;" : "color: #4CAF50;",
    ];

    console[logMethod](...primaryMessage);

    // Detailed performance metrics
    console.log("📈 Performance Metrics:", {
      actualDuration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`,
      wastedTime: `${wastedTime.toFixed(2)}ms`,
      renderEfficiency: `${renderEfficiency.toFixed(1)}%`,
      startTime: startTime.toFixed(2),
      commitTime: commitTime.toFixed(2),
      timings: {
        renderStart: new Date(
          performance.timeOrigin + startTime,
        ).toLocaleTimeString(),
        commitComplete: new Date(
          performance.timeOrigin + commitTime,
        ).toLocaleTimeString(),
      },
    });

    // Component statistics
    console.log("🔢 Component Stats:", {
      totalRenders: stats.totalRenders,
      averageDuration: `${stats.avgDuration.toFixed(2)}ms`,
      maxDuration: `${stats.maxDuration.toFixed(2)}ms`,
      minDuration:
        stats.minDuration === Infinity
          ? "N/A"
          : `${stats.minDuration.toFixed(2)}ms`,
      mountCount: stats.mountCount,
      updateCount: stats.updateCount,
      lastRenderAgo: `${Date.now() - stats.lastRender}ms ago`,
    });

    // Re-render analysis
    if (rerenderInfo) {
      const icon = rerenderInfo.isRapidRerender ? "🔄⚡" : "🔄";
      console.log(`${icon} Re-render Analysis:`, {
        recentRenderCount: rerenderInfo.recentRenderCount,
        timeSinceLastRender: rerenderInfo.timeSinceLastRender
          ? `${rerenderInfo.timeSinceLastRender}ms`
          : "N/A",
        isRapidRerender: rerenderInfo.isRapidRerender,
        warning: rerenderInfo.isRapidRerender
          ? "⚠️ Potential performance issue: Rapid re-renders detected!"
          : null,
      });
    }

    // Interaction tracking
    if (interactionData && interactionData.length > 0) {
      console.log(
        "👆 User Interactions:",
        interactionData.map((i) => ({
          name: i.name,
          timestamp: new Date(i.timestamp).toLocaleTimeString(),
          occurrences: i.totalOccurrences,
        })),
      );
    }

    // Memory usage
    if (memoryInfo) {
      const memoryWarning =
        memoryInfo.used > memoryInfo.limit * 0.8
          ? "⚠️ High memory usage!"
          : null;
      console.log("🧠 Memory Usage:", {
        used: `${memoryInfo.used}MB`,
        allocated: `${memoryInfo.allocated}MB`,
        limit: `${memoryInfo.limit}MB`,
        utilization: `${((memoryInfo.used / memoryInfo.limit) * 100).toFixed(1)}%`,
        warning: memoryWarning,
      });
    }

    // Performance recommendations
    const recommendations: string[] = [];

    if (wastedTime > 5) {
      recommendations.push(
        "Consider using React.memo() or useMemo() to prevent unnecessary re-renders",
      );
    }

    if (rerenderInfo?.isRapidRerender) {
      recommendations.push(
        "Check for dependencies in useEffect/useMemo that change frequently",
      );
      recommendations.push(
        "Consider debouncing state updates or user interactions",
      );
    }

    if (actualDuration > 50) {
      recommendations.push(
        "This component is very slow - consider code splitting or lazy loading",
      );
      recommendations.push(
        "Profile individual child components to identify bottlenecks",
      );
    }

    if (phase === "update" && baseDuration < actualDuration * 0.3) {
      recommendations.push(
        "Memoization opportunities detected - many child components could be optimized",
      );
    }

    if (recommendations.length > 0) {
      console.log("💡 Optimization Suggestions:", recommendations);
    }

    // Stack trace for debugging (optional)
    if (showStackTrace && severity !== "info") {
      console.trace("📍 Component render stack trace");
    }

    if (groupLogs) {
      console.groupEnd();
    }

    // Add separator for readability
    console.log("%c" + "─".repeat(80), "color: #ddd;");
  };
};

// Usage examples and utility functions

// Create callback with default development settings
export const createDefaultDevCallback = (): ProfilerOnRenderCallback =>
  createDevProfilerCallback({
    logThreshold: 0.5,
    warnThreshold: 16,
    errorThreshold: 50,
    colorizedLogs: true,
    trackRerenders: true,
    showMemoryUsage: true,
    visualIndicators: true,
    groupLogs: true,
  });

// Create callback focused on performance issues only
export const createPerformanceFocusedCallback = (): ProfilerOnRenderCallback =>
  createDevProfilerCallback({
    logThreshold: 10, // Only log slow renders
    warnThreshold: 16,
    errorThreshold: 50,
    trackRerenders: true,
    showStackTrace: true, // Show stack traces for slow renders
    visualIndicators: true,
  });

// Create callback for specific components
export const createComponentFocusedCallback = (
  componentIds: string[],
): ProfilerOnRenderCallback =>
  createDevProfilerCallback({
    componentWhitelist: componentIds,
    logThreshold: 0,
    trackRerenders: true,
    showMemoryUsage: true,
    groupLogs: true,
  });

// Utility function to get component statistics summary
export const getComponentStatsSummary = (): void => {
  // Access the componentStats from the callback closure
  console.group("📊 Component Performance Summary");

  // This would need to be implemented by storing stats globally
  // or returning them from the callback function
  console.log(
    "Use the callback with trackRerenders: true to see individual component stats",
  );

  console.groupEnd();
};

// Export types for external use
export type {
  DevProfilerOptions,
  ComponentStats,
  MemoryInfo,
  RerenderInfo,
  InteractionData,
  LogSeverity,
};

// Example usage in your app:
/*
import { Profiler } from 'react';
import { createDefaultDevCallback, createPerformanceFocusedCallback, createComponentFocusedCallback } from './profiler';

const onRenderCallback = createDefaultDevCallback();

function App(): JSX.Element {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourAppContent />
    </Profiler>
  );
}

// For specific problematic components:
const slowComponentCallback = createPerformanceFocusedCallback();

function ProblematicComponent(): JSX.Element {
  return (
    <Profiler id="ProblematicComponent" onRender={slowComponentCallback}>
      <SlowRenderingContent />
    </Profiler>
  );
}

// To add visual indicators, add data attributes to your JSX:
function MyComponent(): JSX.Element {
  return (
    <div data-profiler-id="MyComponent">
      Component content
    </div>
  );
}
*/
