import { useState } from "react";

interface ColorSwatch {
  name: string;
  cssVar: string;
  bgClass: string;
  textClass: string;
  description: string;
  category: string;
}

const colorSwatches: ColorSwatch[] = [
  // Background Colors
  {
    name: "Background",
    cssVar: "--background",
    bgClass: "bg-background",
    textClass: "text-background",
    description: "Main page background",
    category: "Background",
  },
  {
    name: "Foreground",
    cssVar: "--foreground",
    bgClass: "bg-foreground",
    textClass: "text-foreground",
    description: "Primary text color",
    category: "Background",
  },
  {
    name: "Card",
    cssVar: "--card",
    bgClass: "bg-card",
    textClass: "text-card",
    description: "Card background",
    category: "Background",
  },
  {
    name: "Card Foreground",
    cssVar: "--card-foreground",
    bgClass: "bg-card-foreground",
    textClass: "text-card-foreground",
    description: "Card text color",
    category: "Background",
  },
  {
    name: "Popover",
    cssVar: "--popover",
    bgClass: "bg-popover",
    textClass: "text-popover",
    description: "Popover background",
    category: "Background",
  },
  {
    name: "Popover Foreground",
    cssVar: "--popover-foreground",
    bgClass: "bg-popover-foreground",
    textClass: "text-popover-foreground",
    description: "Popover text color",
    category: "Background",
  },

  // Primary Colors
  {
    name: "Primary",
    cssVar: "--primary",
    bgClass: "bg-primary",
    textClass: "text-primary",
    description: "Primary brand color",
    category: "Primary",
  },
  {
    name: "Primary Foreground",
    cssVar: "--primary-foreground",
    bgClass: "bg-primary-foreground",
    textClass: "text-primary-foreground",
    description: "Text on primary background",
    category: "Primary",
  },

  // Secondary Colors
  {
    name: "Secondary",
    cssVar: "--secondary",
    bgClass: "bg-secondary",
    textClass: "text-secondary",
    description: "Secondary brand color",
    category: "Secondary",
  },
  {
    name: "Secondary Foreground",
    cssVar: "--secondary-foreground",
    bgClass: "bg-secondary-foreground",
    textClass: "text-secondary-foreground",
    description: "Text on secondary background",
    category: "Secondary",
  },

  // Muted Colors
  {
    name: "Muted",
    cssVar: "--muted",
    bgClass: "bg-muted",
    textClass: "text-muted",
    description: "Muted background for subtle elements",
    category: "Muted",
  },
  {
    name: "Muted Foreground",
    cssVar: "--muted-foreground",
    bgClass: "bg-muted-foreground",
    textClass: "text-muted-foreground",
    description: "Muted text color for secondary text",
    category: "Muted",
  },

  // Accent Colors
  {
    name: "Accent",
    cssVar: "--accent",
    bgClass: "bg-accent",
    textClass: "text-accent",
    description: "Accent background for highlights",
    category: "Accent",
  },
  {
    name: "Accent Foreground",
    cssVar: "--accent-foreground",
    bgClass: "bg-accent-foreground",
    textClass: "text-accent-foreground",
    description: "Text on accent background",
    category: "Accent",
  },

  // Destructive Colors
  {
    name: "Destructive",
    cssVar: "--destructive",
    bgClass: "bg-destructive",
    textClass: "text-destructive",
    description: "Error/danger color for warnings",
    category: "Destructive",
  },

  // Border & Input Colors
  {
    name: "Border",
    cssVar: "--border",
    bgClass: "bg-border",
    textClass: "text-border",
    description: "Border color for components",
    category: "Border",
  },
  {
    name: "Input",
    cssVar: "--input",
    bgClass: "bg-input",
    textClass: "text-input",
    description: "Input border and background",
    category: "Border",
  },
  {
    name: "Ring",
    cssVar: "--ring",
    bgClass: "bg-ring",
    textClass: "text-ring",
    description: "Focus ring color",
    category: "Border",
  },

  // Chart Colors
  {
    name: "Chart 1",
    cssVar: "--chart-1",
    bgClass: "bg-chart-1",
    textClass: "text-chart-1",
    description: "First chart color",
    category: "Chart Colors",
  },
  {
    name: "Chart 2",
    cssVar: "--chart-2",
    bgClass: "bg-chart-2",
    textClass: "text-chart-2",
    description: "Second chart color",
    category: "Chart Colors",
  },
  {
    name: "Chart 3",
    cssVar: "--chart-3",
    bgClass: "bg-chart-3",
    textClass: "text-chart-3",
    description: "Third chart color",
    category: "Chart Colors",
  },
  {
    name: "Chart 4",
    cssVar: "--chart-4",
    bgClass: "bg-chart-4",
    textClass: "text-chart-4",
    description: "Fourth chart color",
    category: "Chart Colors",
  },
  {
    name: "Chart 5",
    cssVar: "--chart-5",
    bgClass: "bg-chart-5",
    textClass: "text-chart-5",
    description: "Fifth chart color",
    category: "Chart Colors",
  },

  // Sidebar Colors
  {
    name: "Sidebar",
    cssVar: "--sidebar",
    bgClass: "bg-sidebar",
    textClass: "text-sidebar",
    description: "Sidebar background",
    category: "Sidebar",
  },
  {
    name: "Sidebar Foreground",
    cssVar: "--sidebar-foreground",
    bgClass: "bg-sidebar-foreground",
    textClass: "text-sidebar-foreground",
    description: "Sidebar text color",
    category: "Sidebar",
  },
  {
    name: "Sidebar Primary",
    cssVar: "--sidebar-primary",
    bgClass: "bg-sidebar-primary",
    textClass: "text-sidebar-primary",
    description: "Sidebar primary color",
    category: "Sidebar",
  },
  {
    name: "Sidebar Primary Foreground",
    cssVar: "--sidebar-primary-foreground",
    bgClass: "bg-sidebar-primary-foreground",
    textClass: "text-sidebar-primary-foreground",
    description: "Text on sidebar primary",
    category: "Sidebar",
  },
  {
    name: "Sidebar Accent",
    cssVar: "--sidebar-accent",
    bgClass: "bg-sidebar-accent",
    textClass: "text-sidebar-accent",
    description: "Sidebar accent color",
    category: "Sidebar",
  },
  {
    name: "Sidebar Accent Foreground",
    cssVar: "--sidebar-accent-foreground",
    bgClass: "bg-sidebar-accent-foreground",
    textClass: "text-sidebar-accent-foreground",
    description: "Text on sidebar accent",
    category: "Sidebar",
  },
  {
    name: "Sidebar Border",
    cssVar: "--sidebar-border",
    bgClass: "bg-sidebar-border",
    textClass: "text-sidebar-border",
    description: "Sidebar border color",
    category: "Sidebar",
  },
  {
    name: "Sidebar Ring",
    cssVar: "--sidebar-ring",
    bgClass: "bg-sidebar-ring",
    textClass: "text-sidebar-ring",
    description: "Sidebar focus ring",
    category: "Sidebar",
  },
];

const categories = [
  "Background",
  "Primary",
  "Secondary",
  "Muted",
  "Accent",
  "Destructive",
  "Border",
  "Chart Colors",
  "Sidebar",
];

export default function ColorSchemeRoute() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredSwatches = colorSwatches.filter((swatch) => {
    const matchesSearch =
      swatch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      swatch.cssVar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      swatch.bgClass.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || swatch.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="bg-background text-foreground mt-13 container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">
            Complete Color Scheme Reference
          </h1>
          <p className="text-muted-foreground text-lg">
            All {colorSwatches.length} CSS color variables from your design
            system
          </p>

          {/* Controls */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Search colors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input border-border focus:ring-ring rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-input border-border focus:ring-ring rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Reference Grid */}
        <div className="bg-card border-border rounded-lg border p-6">
          <h2 className="text-card-foreground mb-4 text-2xl font-semibold">
            Quick Reference
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[
              "primary",
              "secondary",
              "muted",
              "accent",
              "destructive",
              "background",
            ].map((color) => {
              const swatch = colorSwatches.find(
                (s) => s.cssVar === `--${color}`,
              );
              return (
                <div key={color} className="space-y-2 text-center">
                  <div
                    className={`border-border h-16 w-full rounded-lg border ${swatch?.bgClass}`}
                  />
                  <div>
                    <p className="text-card-foreground text-sm font-medium capitalize">
                      {color}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {swatch?.bgClass}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Color Swatches by Category */}
        {categories.map((category) => {
          const categorySwatches = filteredSwatches.filter(
            (swatch) => swatch.category === category,
          );
          if (categorySwatches.length === 0) return null;

          return (
            <div
              key={category}
              className="bg-card border-border rounded-lg border p-6"
            >
              <h2 className="text-card-foreground mb-4 text-2xl font-semibold capitalize">
                {category} Colors ({categorySwatches.length})
              </h2>
              <div className="grid gap-4">
                {categorySwatches.map((swatch) => (
                  <div
                    key={swatch.cssVar}
                    className="bg-muted/30 border-border flex items-center gap-4 rounded-lg border p-4"
                  >
                    {/* Color Preview */}
                    <div className="flex-shrink-0">
                      <div
                        className={`border-border h-16 w-16 rounded-lg border-2 shadow-sm ${swatch.bgClass}`}
                      />
                    </div>

                    {/* Color Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-card-foreground text-lg font-semibold">
                        {swatch.name}
                      </h3>
                      <p className="text-muted-foreground mb-2 text-sm">
                        {swatch.description}
                      </p>

                      {/* Code Examples */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2 text-xs">
                          <code className="bg-muted rounded px-2 py-1 font-mono">
                            {swatch.cssVar}
                          </code>
                          <code className="bg-muted rounded px-2 py-1 font-mono">
                            {swatch.bgClass}
                          </code>
                          <code className="bg-muted rounded px-2 py-1 font-mono">
                            {swatch.textClass}
                          </code>
                        </div>

                        {/* CSS Variable */}
                        <div className="text-muted-foreground text-xs">
                          <div>
                            CSS Variable:{" "}
                            <code className="bg-muted rounded px-1">
                              {swatch.cssVar}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Usage Examples */}
        <div className="bg-card border-border rounded-lg border p-6">
          <h2 className="text-card-foreground mb-4 text-2xl font-semibold">
            Usage Examples
          </h2>

          <div className="space-y-8">
            {/* Buttons */}
            <div>
              <h3 className="text-card-foreground mb-3 text-lg font-semibold">
                Buttons
              </h3>
              <div className="mb-2 flex flex-wrap gap-3">
                <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:opacity-90">
                  Primary
                </button>
                <button className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 hover:opacity-90">
                  Secondary
                </button>
                <button className="bg-muted text-muted-foreground rounded-lg px-4 py-2 hover:opacity-90">
                  Muted
                </button>
                <button className="bg-destructive text-primary-foreground rounded-lg px-4 py-2 hover:opacity-90">
                  Destructive
                </button>
              </div>
              <code className="text-muted-foreground text-xs">
                bg-primary text-primary-foreground
              </code>
            </div>

            {/* Text Examples */}
            <div>
              <h3 className="text-card-foreground mb-3 text-lg font-semibold">
                Text Colors
              </h3>
              <div className="space-y-2">
                <p className="text-foreground">
                  Foreground text (primary text)
                </p>
                <p className="text-muted-foreground">
                  Muted foreground (secondary text)
                </p>
                <p className="text-primary">Primary colored text</p>
                <p className="text-secondary">Secondary colored text</p>
                <p className="text-destructive">Destructive colored text</p>
              </div>
            </div>

            {/* Backgrounds */}
            <div>
              <h3 className="text-card-foreground mb-3 text-lg font-semibold">
                Background Examples
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-muted-foreground text-sm">
                    Muted background
                  </p>
                </div>
                <div className="bg-accent rounded-lg p-4">
                  <p className="text-accent-foreground text-sm">
                    Accent background
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-secondary-foreground text-sm">
                    Secondary background
                  </p>
                </div>
                <div className="bg-primary rounded-lg p-4">
                  <p className="text-primary-foreground text-sm">
                    Primary background
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Variables List */}
        <div className="bg-card border-border rounded-lg border p-6">
          <h2 className="text-card-foreground mb-4 text-2xl font-semibold">
            All CSS Variables
          </h2>
          <div className="max-h-96 space-y-1 overflow-y-auto text-sm">
            {filteredSwatches.map((swatch) => (
              <div
                key={swatch.cssVar}
                className="bg-muted/20 flex items-center justify-between rounded p-2"
              >
                <code className="text-foreground font-mono">
                  {swatch.cssVar}
                </code>
                <span className="text-muted-foreground">{swatch.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-muted-foreground text-center text-sm">
          Showing {filteredSwatches.length} of {colorSwatches.length} colors
        </div>
      </div>
    </div>
  );
}
