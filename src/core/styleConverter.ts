import {
  FigmaNode,
  Fill,
  Effect,
  Color,
  DesignTokens,
  TypeToken,
} from "@/types/figma";

export class StyleConverter {
  private designTokens: DesignTokens;
  private styleIdToNameMap: Map<string, string> = new Map();

  constructor(
    designTokens: DesignTokens = {
      colors: {},
      typography: {},
      spacing: {},
      borderRadius: {},
      shadows: {},
    },
  ) {
    this.designTokens = designTokens;
  }

  setStyleIdMap(styleIdToNameMap: Map<string, string>) {
    this.styleIdToNameMap = styleIdToNameMap;
  }

  convertNodeToStyles(node: FigmaNode): Record<string, any> {
    const styles: Record<string, any> = {};

    // Layout properties - Auto Layout → Flexbox
    if (node.layoutMode && node.layoutMode !== "NONE") {
      styles.display = "flex";

      if (node.layoutMode === "HORIZONTAL") {
        styles.flexDirection = "row";
      } else if (node.layoutMode === "VERTICAL") {
        styles.flexDirection = "column";
      }

      // Item spacing → gap
      if (node.itemSpacing !== undefined) {
        styles.gap = `${node.itemSpacing}px`;
      }

      // Padding
      if (node.paddingTop !== undefined)
        styles.paddingTop = `${node.paddingTop}px`;
      if (node.paddingRight !== undefined)
        styles.paddingRight = `${node.paddingRight}px`;
      if (node.paddingBottom !== undefined)
        styles.paddingBottom = `${node.paddingBottom}px`;
      if (node.paddingLeft !== undefined)
        styles.paddingLeft = `${node.paddingLeft}px`;

      // Alignment
      if (node.primaryAxisAlignItems) {
        switch (node.primaryAxisAlignItems) {
          case "MIN":
            styles.justifyContent = "flex-start";
            break;
          case "CENTER":
            styles.justifyContent = "center";
            break;
          case "MAX":
            styles.justifyContent = "flex-end";
            break;
          case "SPACE_BETWEEN":
            styles.justifyContent = "space-between";
            break;
        }
      }

      if (node.counterAxisAlignItems) {
        switch (node.counterAxisAlignItems) {
          case "MIN":
            styles.alignItems = "flex-start";
            break;
          case "CENTER":
            styles.alignItems = "center";
            break;
          case "MAX":
            styles.alignItems = "flex-end";
            break;
        }
      }
    }

    // Position and size
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      if (width) styles.width = `${width}px`;
      if (height) styles.height = `${height}px`;
    }

    // Background fills
    if (node.fills && node.fills.length > 0) {
      const primaryFill =
        node.fills.find((fill) => fill.visible !== false) || node.fills[0];
      const background = this.convertFillToCSS(primaryFill, node.fillStyleId);
      if (background) {
        if (primaryFill.type === "SOLID") {
          styles.backgroundColor = background;
        } else {
          styles.background = background;
        }
      }
    }

    // Strokes → border
    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.visible !== false && stroke.color) {
        const borderColor = this.colorToString(stroke.color);
        const borderWidth = stroke.thickness || 1;
        styles.border = `${borderWidth}px solid ${borderColor}`;
      }
    }

    // Corner radius
    if (node.cornerRadius !== undefined && node.cornerRadius > 0) {
      styles.borderRadius = `${node.cornerRadius}px`;
    } else if (
      node.rectangleCornerRadii &&
      node.rectangleCornerRadii.length === 4
    ) {
      const [topLeft, topRight, bottomRight, bottomLeft] =
        node.rectangleCornerRadii;
      styles.borderRadius = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
    }

    // Effects → box-shadow
    if (node.effects && node.effects.length > 0) {
      const shadows = node.effects
        .filter((effect) => effect.visible !== false)
        .map((effect) => this.convertEffectToCSS(effect))
        .filter(Boolean);

      if (shadows.length > 0) {
        styles.boxShadow = shadows.join(", ");
      }
    }

    // Typography
    if (node.style && node.type === "TEXT") {
      const typographyStyles = this.convertTypographyToCSS(
        node.style,
        node.textStyleId,
      );
      Object.assign(styles, typographyStyles);
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
      styles.opacity = node.opacity;
    }

    // Visibility
    if (node.visible === false) {
      styles.display = "none";
    }

    return styles;
  }

  private convertFillToCSS(fill: Fill, styleId?: string): string | null {
    if (!fill || fill.visible === false) return null;

    // Check if we should use a design token
    if (styleId && this.styleIdToNameMap.has(styleId)) {
      const tokenName = this.styleIdToNameMap.get(styleId)!;
      const cssVariableName = this.convertStyleNameToCSSVariable(tokenName);
      return `var(${cssVariableName})`;
    }

    switch (fill.type) {
      case "SOLID":
        return fill.color ? this.colorToString(fill.color) : null;

      case "GRADIENT_LINEAR":
        return this.convertGradientToCSS(fill);

      case "GRADIENT_RADIAL":
        return this.convertRadialGradientToCSS(fill);

      case "IMAGE":
        if (fill.imageRef) {
          return `url(${fill.imageRef})`;
        }
        return null;

      default:
        return null;
    }
  }

  private convertGradientToCSS(fill: Fill): string | null {
    if (!fill.gradientStops || !fill.gradientHandlePositions) return null;

    const stops = fill.gradientStops
      .map(
        (stop) =>
          `${this.colorToString(stop.color)} ${(stop.position * 100).toFixed(1)}%`,
      )
      .join(", ");

    // Calculate angle from gradient handle positions
    const angle = this.calculateGradientAngle(fill.gradientHandlePositions);

    return `linear-gradient(${angle}deg, ${stops})`;
  }

  private convertRadialGradientToCSS(fill: Fill): string | null {
    if (!fill.gradientStops) return null;

    const stops = fill.gradientStops
      .map(
        (stop) =>
          `${this.colorToString(stop.color)} ${(stop.position * 100).toFixed(1)}%`,
      )
      .join(", ");

    return `radial-gradient(circle, ${stops})`;
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

  private convertEffectToCSS(effect: Effect): string | null {
    if (!effect.visible || !effect.color) return null;

    switch (effect.type) {
      case "DROP_SHADOW":
        const x = effect.offset?.x || 0;
        const y = effect.offset?.y || 0;
        const blur = effect.radius || 0;
        const spread = effect.spread || 0;
        const color = this.colorToString(effect.color);
        return `${x}px ${y}px ${blur}px ${spread}px ${color}`;

      case "INNER_SHADOW":
        const innerX = effect.offset?.x || 0;
        const innerY = effect.offset?.y || 0;
        const innerBlur = effect.radius || 0;
        const innerSpread = effect.spread || 0;
        const innerColor = this.colorToString(effect.color);
        return `inset ${innerX}px ${innerY}px ${innerBlur}px ${innerSpread}px ${innerColor}`;

      default:
        return null;
    }
  }

  private convertTypographyToCSS(
    style: any,
    textStyleId?: string,
  ): Record<string, any> {
    const typography: Record<string, any> = {};

    // Check if we should use a design token
    if (textStyleId && this.styleIdToNameMap.has(textStyleId)) {
      const tokenName = this.styleIdToNameMap.get(textStyleId)!;
      // For typography, we might want to use individual properties or a single token
      // For now, we'll use individual properties
    }

    if (style.fontFamily) {
      typography.fontFamily = `"${style.fontFamily}", sans-serif`;
    }

    if (style.fontSize) {
      typography.fontSize = `${style.fontSize}px`;
    }

    if (style.fontWeight) {
      typography.fontWeight = style.fontWeight;
    }

    if (style.lineHeightPx) {
      typography.lineHeight = `${style.lineHeightPx}px`;
    } else if (style.lineHeightPercent) {
      typography.lineHeight = `${style.lineHeightPercent}%`;
    }

    if (style.letterSpacing) {
      typography.letterSpacing = `${style.letterSpacing}px`;
    }

    if (style.textAlignHorizontal) {
      switch (style.textAlignHorizontal) {
        case "LEFT":
          typography.textAlign = "left";
          break;
        case "CENTER":
          typography.textAlign = "center";
          break;
        case "RIGHT":
          typography.textAlign = "right";
          break;
        case "JUSTIFIED":
          typography.textAlign = "justify";
          break;
      }
    }

    if (style.textDecoration) {
      typography.textDecoration = style.textDecoration.toLowerCase();
    }

    if (style.textCase) {
      switch (style.textCase) {
        case "UPPER":
          typography.textTransform = "uppercase";
          break;
        case "LOWER":
          typography.textTransform = "lowercase";
          break;
        case "TITLE":
          typography.textTransform = "capitalize";
          break;
      }
    }

    return typography;
  }

  private colorToString(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = color.a !== undefined ? color.a : 1;

    if (a === 1) {
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
  }

  private convertStyleNameToCSSVariable(styleName: string): string {
    // Convert "Colors/Primary/500" → "--colors-primary-500"
    return (
      "--" +
      styleName
        .toLowerCase()
        .replace(/\//g, "-")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    );
  }

  generateDesignTokensCSS(designTokens: DesignTokens): string {
    let css = ":root {\n";

    // Colors
    Object.entries(designTokens.colors).forEach(([name, value]) => {
      css += `  --${name}: ${value};\n`;
    });

    // Typography
    Object.entries(designTokens.typography).forEach(([name, token]) => {
      css += `  --${name}-font-size: ${token.fontSize};\n`;
      css += `  --${name}-font-weight: ${token.fontWeight};\n`;
      css += `  --${name}-line-height: ${token.lineHeight};\n`;
      css += `  --${name}-font-family: ${token.fontFamily};\n`;
      if (token.letterSpacing) {
        css += `  --${name}-letter-spacing: ${token.letterSpacing};\n`;
      }
    });

    // Spacing
    Object.entries(designTokens.spacing).forEach(([name, value]) => {
      css += `  --spacing-${name}: ${value};\n`;
    });

    // Border radius
    Object.entries(designTokens.borderRadius).forEach(([name, value]) => {
      css += `  --border-radius-${name}: ${value};\n`;
    });

    // Shadows
    Object.entries(designTokens.shadows).forEach(([name, value]) => {
      css += `  --shadow-${name}: ${value};\n`;
    });

    css += "}";

    return css;
  }

  stylesToEmotionCSS(styles: Record<string, any>): string {
    const entries = Object.entries(styles).map(([key, value]) => {
      // Convert camelCase to kebab-case for CSS
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `  ${cssKey}: '${value}'`;
    });

    return `{\n${entries.join(",\n")}\n}`;
  }
}

export const styleConverter = new StyleConverter();
