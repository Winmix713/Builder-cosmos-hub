import {
  FigmaNode,
  Color,
  Fill,
  Effect,
  TypeStyle,
  DesignTokens,
} from "@/types/figma";

export class StyleTransformer {
  private extractedColors = new Set<string>();
  private extractedTypography = new Map<string, TypeStyle>();
  private extractedSpacing = new Set<number>();
  private extractedBorderRadius = new Set<number>();
  private extractedShadows = new Set<string>();

  colorToHex(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  colorToRgba(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = color.a !== undefined ? color.a : 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  extractDesignTokens(node: FigmaNode): DesignTokens {
    this.extractedColors.clear();
    this.extractedTypography.clear();
    this.extractedSpacing.clear();
    this.extractedBorderRadius.clear();
    this.extractedShadows.clear();

    this.traverseNode(node);

    return {
      colors: this.generateColorTokens(),
      typography: this.generateTypographyTokens(),
      spacing: this.generateSpacingTokens(),
      borderRadius: this.generateBorderRadiusTokens(),
      shadows: this.generateShadowTokens(),
      breakpoints: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    };
  }

  private traverseNode(node: FigmaNode) {
    // Extract colors from fills
    if (node.fills) {
      node.fills.forEach((fill) => {
        if (fill.color && fill.visible !== false) {
          this.extractedColors.add(this.colorToHex(fill.color));
        }
      });
    }

    // Extract colors from strokes
    if (node.strokes) {
      node.strokes.forEach((stroke) => {
        if (stroke.color && stroke.visible !== false) {
          this.extractedColors.add(this.colorToHex(stroke.color));
        }
      });
    }

    // Extract typography
    if (node.style && node.type === "TEXT") {
      const key = `${node.style.fontFamily}-${node.style.fontSize}-${node.style.fontWeight}`;
      this.extractedTypography.set(key, node.style);
    }

    // Extract spacing from absolute bounds
    if (node.absoluteBoundingBox) {
      this.extractedSpacing.add(node.absoluteBoundingBox.width);
      this.extractedSpacing.add(node.absoluteBoundingBox.height);
    }

    // Extract border radius
    if (node.cornerRadius !== undefined) {
      this.extractedBorderRadius.add(node.cornerRadius);
    }

    if (node.rectangleCornerRadii) {
      node.rectangleCornerRadii.forEach((radius) => {
        this.extractedBorderRadius.add(radius);
      });
    }

    // Extract shadows from effects
    if (node.effects) {
      node.effects.forEach((effect) => {
        if (effect.type === "DROP_SHADOW" && effect.visible !== false) {
          const shadow = this.effectToShadow(effect);
          if (shadow) {
            this.extractedShadows.add(shadow);
          }
        }
      });
    }

    // Recursively process children
    if (node.children) {
      node.children.forEach((child) => this.traverseNode(child));
    }
  }

  private generateColorTokens(): Record<string, string> {
    const colors: Record<string, string> = {};
    const colorArray = Array.from(this.extractedColors).sort();

    colorArray.forEach((color, index) => {
      // Try to generate semantic names based on color values
      const name = this.generateColorName(color, index);
      colors[name] = color;
    });

    return colors;
  }

  private generateColorName(hex: string, index: number): string {
    const colorMap: Record<string, string> = {
      "#000000": "black",
      "#ffffff": "white",
      "#f3f4f6": "gray-100",
      "#e5e7eb": "gray-200",
      "#d1d5db": "gray-300",
      "#9ca3af": "gray-400",
      "#6b7280": "gray-500",
      "#374151": "gray-600",
      "#1f2937": "gray-700",
      "#111827": "gray-800",
      "#0f172a": "gray-900",
    };

    if (colorMap[hex.toLowerCase()]) {
      return colorMap[hex.toLowerCase()];
    }

    // Simple heuristic for common colors
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (r > 200 && g < 100 && b < 100) return `red-${index + 1}`;
    if (r < 100 && g > 200 && b < 100) return `green-${index + 1}`;
    if (r < 100 && g < 100 && b > 200) return `blue-${index + 1}`;
    if (r > 200 && g > 200 && b < 100) return `yellow-${index + 1}`;
    if (r > 200 && g < 100 && b > 200) return `purple-${index + 1}`;
    if (r < 100 && g > 200 && b > 200) return `cyan-${index + 1}`;

    return `color-${index + 1}`;
  }

  private generateTypographyTokens(): Record<string, any> {
    const typography: Record<string, any> = {};

    Array.from(this.extractedTypography.entries()).forEach(
      ([key, style], index) => {
        const name = this.generateTypographyName(style, index);
        typography[name] = {
          fontSize: `${style.fontSize}px`,
          fontWeight: style.fontWeight.toString(),
          lineHeight: style.lineHeightPx
            ? `${style.lineHeightPx}px`
            : style.lineHeightPercent
              ? `${style.lineHeightPercent}%`
              : "1.5",
          fontFamily: style.fontFamily,
        };
      },
    );

    return typography;
  }

  private generateTypographyName(style: TypeStyle, index: number): string {
    const size = style.fontSize;

    if (size >= 48) return "display";
    if (size >= 36) return "heading-1";
    if (size >= 30) return "heading-2";
    if (size >= 24) return "heading-3";
    if (size >= 20) return "heading-4";
    if (size >= 18) return "heading-5";
    if (size >= 16) return "heading-6";
    if (size >= 14) return "body";
    if (size >= 12) return "small";

    return `text-${index + 1}`;
  }

  private generateSpacingTokens(): Record<string, string> {
    const spacing: Record<string, string> = {};
    const spacingArray = Array.from(this.extractedSpacing)
      .filter((value) => value > 0 && value <= 1000)
      .sort((a, b) => a - b);

    // Generate standard spacing scale
    const standardSpacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];

    standardSpacing.forEach((value, index) => {
      spacing[index.toString()] = `${value}px`;
    });

    return spacing;
  }

  private generateBorderRadiusTokens(): Record<string, string> {
    const borderRadius: Record<string, string> = {};
    const radiusArray = Array.from(this.extractedBorderRadius).sort(
      (a, b) => a - b,
    );

    const standardRadius = [0, 2, 4, 6, 8, 12, 16, 24, 32];

    standardRadius.forEach((value) => {
      const name =
        value === 0
          ? "none"
          : value === 2
            ? "sm"
            : value === 4
              ? "DEFAULT"
              : value === 6
                ? "md"
                : value === 8
                  ? "lg"
                  : value === 12
                    ? "xl"
                    : value === 16
                      ? "2xl"
                      : value === 24
                        ? "3xl"
                        : "full";
      borderRadius[name] = `${value}px`;
    });

    return borderRadius;
  }

  private generateShadowTokens(): Record<string, string> {
    const shadows: Record<string, string> = {};
    const shadowArray = Array.from(this.extractedShadows);

    shadowArray.forEach((shadow, index) => {
      shadows[`shadow-${index + 1}`] = shadow;
    });

    // Add standard shadows
    shadows["sm"] = "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    shadows["DEFAULT"] =
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
    shadows["md"] =
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    shadows["lg"] =
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
    shadows["xl"] =
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";

    return shadows;
  }

  private effectToShadow(effect: Effect): string | null {
    if (!effect.color || !effect.offset) return null;

    const x = effect.offset.x || 0;
    const y = effect.offset.y || 0;
    const blur = effect.radius || 0;
    const spread = effect.spread || 0;
    const color = this.colorToRgba(effect.color);

    return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }

  transformFillToCSS(fill: Fill): string {
    if (!fill.visible) return "";

    switch (fill.type) {
      case "SOLID":
        return fill.color ? this.colorToRgba(fill.color) : "";

      case "GRADIENT_LINEAR":
        if (fill.gradientStops && fill.gradientHandlePositions) {
          const stops = fill.gradientStops
            .map(
              (stop) =>
                `${this.colorToRgba(stop.color)} ${(stop.position * 100).toFixed(1)}%`,
            )
            .join(", ");

          // Calculate angle from gradient handle positions
          const angle = this.calculateGradientAngle(
            fill.gradientHandlePositions,
          );
          return `linear-gradient(${angle}deg, ${stops})`;
        }
        return "";

      case "GRADIENT_RADIAL":
        if (fill.gradientStops) {
          const stops = fill.gradientStops
            .map(
              (stop) =>
                `${this.colorToRgba(stop.color)} ${(stop.position * 100).toFixed(1)}%`,
            )
            .join(", ");
          return `radial-gradient(circle, ${stops})`;
        }
        return "";

      default:
        return "";
    }
  }

  private calculateGradientAngle(handlePositions: any[]): number {
    if (handlePositions.length < 2) return 0;

    const start = handlePositions[0];
    const end = handlePositions[1];

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;

    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 90) % 360;

    return Math.round(angle);
  }

  generateTailwindConfig(designTokens: DesignTokens): string {
    return `module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: ${JSON.stringify(designTokens.colors, null, 6)},
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: ${JSON.stringify(
        Object.fromEntries(
          Object.entries(designTokens.typography).map(([key, value]) => [
            key,
            [
              value.fontSize,
              { lineHeight: value.lineHeight, fontWeight: value.fontWeight },
            ],
          ]),
        ),
        null,
        6,
      )},
      spacing: ${JSON.stringify(designTokens.spacing, null, 6)},
      borderRadius: ${JSON.stringify(designTokens.borderRadius, null, 6)},
      boxShadow: ${JSON.stringify(designTokens.shadows, null, 6)},
      screens: ${JSON.stringify(designTokens.breakpoints, null, 6)},
    },
  },
  plugins: [],
}`;
  }
}

export const styleTransformer = new StyleTransformer();
