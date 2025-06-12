// Debug segédeszközök a fejlesztéshez

export const DEBUG = {
  enabled: import.meta.env.DEV, // Csak development módban

  log: (...args: any[]) => {
    if (DEBUG.enabled) {
      console.log("[Figma Converter]", ...args);
    }
  },

  error: (...args: any[]) => {
    if (DEBUG.enabled) {
      console.error("[Figma Converter ERROR]", ...args);
    }
  },

  warn: (...args: any[]) => {
    if (DEBUG.enabled) {
      console.warn("[Figma Converter WARN]", ...args);
    }
  },

  group: (title: string, fn: () => void) => {
    if (DEBUG.enabled) {
      console.group(`[Figma Converter] ${title}`);
      fn();
      console.groupEnd();
    }
  },

  // Figma API válasz vizsgálata
  inspectFigmaResponse: (response: any) => {
    DEBUG.group("Figma API Response", () => {
      DEBUG.log("Response type:", typeof response);
      DEBUG.log("Response keys:", Object.keys(response || {}));

      if (response?.document) {
        DEBUG.log(
          "Document children count:",
          response.document.children?.length || 0,
        );
        DEBUG.log("Document type:", response.document.type);
      }

      if (response?.components) {
        DEBUG.log("Components count:", Object.keys(response.components).length);
      }

      if (response?.styles) {
        DEBUG.log("Styles count:", Object.keys(response.styles).length);
      }
    });
  },

  // Node fa vizsgálata
  inspectNodeTree: (node: any, depth = 0) => {
    if (!DEBUG.enabled || depth > 3) return; // Maximum 3 szint mélységig

    const indent = "  ".repeat(depth);
    DEBUG.log(
      `${indent}Node: ${node?.name || "unnamed"} (${node?.type || "unknown"})`,
    );

    if (node?.children && Array.isArray(node.children)) {
      DEBUG.log(`${indent}Children: ${node.children.length}`);
      node.children.slice(0, 3).forEach((child: any) => {
        DEBUG.inspectNodeTree(child, depth + 1);
      });

      if (node.children.length > 3) {
        DEBUG.log(`${indent}... and ${node.children.length - 3} more children`);
      }
    }
  },
};

// Export egy egyszerű performance mérő is
export class Timer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
    DEBUG.log(`⏱️ Timer started: ${label}`);
  }

  end() {
    const endTime = performance.now();
    const duration = Math.round(endTime - this.startTime);
    DEBUG.log(`⏱️ Timer ended: ${this.label} - ${duration}ms`);
    return duration;
  }
}
