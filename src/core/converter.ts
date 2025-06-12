import {
  FigmaNode,
  FigmaFile,
  GeneratedComponent,
  ComponentProp,
  ConversionResult,
  DesignTokens,
} from "@/types/figma";
import { StyleConverter } from "./styleConverter";

export class FigmaConverter {
  private styleConverter: StyleConverter;
  private components: Map<string, FigmaNode> = new Map();
  private generatedComponents: GeneratedComponent[] = [];
  private styleIdToNameMap: Map<string, string> = new Map();
  private componentCounter = 0;

  constructor() {
    this.styleConverter = new StyleConverter();
  }

  async convertFigmaFile(figmaFile: FigmaFile): Promise<ConversionResult> {
    try {
      // Initialize design tokens and style mappings
      const designTokens = this.extractDesignTokens(figmaFile);
      this.initializeStyleMappings(figmaFile);
      this.styleConverter.setStyleIdMap(this.styleIdToNameMap);

      // Find all components first
      this.indexComponents(figmaFile.document);

      // Convert main document
      const mainComponents = this.convertDocument(figmaFile.document);

      return {
        success: true,
        components: mainComponents,
        designTokens,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      return {
        success: false,
        components: [],
        designTokens: {
          colors: {},
          typography: {},
          spacing: {},
          borderRadius: {},
          shadows: {},
        },
        errors: [
          error instanceof Error ? error.message : "Ismeretlen hiba történt",
        ],
        warnings: [],
      };
    }
  }

  private initializeStyleMappings(figmaFile: FigmaFile) {
    // Create a mapping from style IDs to style names
    Object.entries(figmaFile.styles).forEach(([styleId, style]) => {
      this.styleIdToNameMap.set(styleId, style.name);
    });
  }

  private indexComponents(node: FigmaNode) {
    if (node.type === "COMPONENT") {
      this.components.set(node.id, node);
    }

    if (node.children) {
      node.children.forEach((child) => this.indexComponents(child));
    }
  }

  private convertDocument(document: FigmaNode): GeneratedComponent[] {
    const components: GeneratedComponent[] = [];

    // Find top-level frames and components
    if (document.children) {
      document.children.forEach((child) => {
        if (child.type === "FRAME" || child.type === "COMPONENT") {
          const component = this.transformNodeToReact(child, true);
          if (component) {
            components.push(component);
          }
        }
      });
    }

    // Add any standalone components
    components.push(...this.generatedComponents);

    return components;
  }

  transformNodeToReact(
    node: FigmaNode,
    isTopLevel = false,
  ): GeneratedComponent | null {
    const componentName = this.generateComponentName(node.name);

    // Handle different node types
    switch (node.type) {
      case "COMPONENT":
        return this.generateComponent(node, componentName, true);

      case "INSTANCE":
        return this.generateInstanceComponent(node, componentName);

      case "FRAME":
      case "GROUP":
        return this.generateFrameComponent(node, componentName, isTopLevel);

      case "TEXT":
        return this.generateTextComponent(node, componentName);

      case "VECTOR":
      case "BOOLEAN_OPERATION":
        return this.generateVectorComponent(node, componentName);

      default:
        return this.generateGenericComponent(node, componentName);
    }
  }

  private generateComponent(
    node: FigmaNode,
    componentName: string,
    isMainComponent = false,
  ): GeneratedComponent {
    const props = this.extractComponentProps(node);
    const styles = this.styleConverter.convertNodeToStyles(node);
    const children = this.generateChildrenCode(node);

    const jsx = this.generateJSX(node, children, props.length > 0);
    const code = this.generateComponentCode(componentName, props, jsx, styles);
    const stylesCode = this.styleConverter.stylesToEmotionCSS(styles);

    return {
      name: componentName,
      code,
      props,
      styles: stylesCode,
      isMainComponent,
    };
  }

  private generateInstanceComponent(
    node: FigmaNode,
    componentName: string,
  ): GeneratedComponent | null {
    if (!node.componentId || !this.components.has(node.componentId)) {
      // Fallback to treating as a regular frame
      return this.generateFrameComponent(node, componentName);
    }

    const masterComponent = this.components.get(node.componentId)!;
    const masterComponentName = this.generateComponentName(
      masterComponent.name,
    );

    // Generate props based on overrides
    const props = this.extractInstanceProps(node, masterComponent);
    const propsString =
      props.length > 0
        ? ` ${props.map((prop) => `${prop.name}={${prop.name}}`).join(" ")}`
        : "";

    const jsx = `<${masterComponentName}${propsString} />`;
    const code = this.generateComponentCode(componentName, props, jsx, {});

    return {
      name: componentName,
      code,
      props,
      styles: "{}",
      isMainComponent: false,
    };
  }

  private generateFrameComponent(
    node: FigmaNode,
    componentName: string,
    isTopLevel = false,
  ): GeneratedComponent {
    const props = this.extractBasicProps(node);
    const styles = this.styleConverter.convertNodeToStyles(node);
    const children = this.generateChildrenCode(node);

    const jsx = this.generateJSX(node, children, props.length > 0);
    const code = this.generateComponentCode(componentName, props, jsx, styles);
    const stylesCode = this.styleConverter.stylesToEmotionCSS(styles);

    return {
      name: componentName,
      code,
      props,
      styles: stylesCode,
      isMainComponent: isTopLevel,
    };
  }

  private generateTextComponent(
    node: FigmaNode,
    componentName: string,
  ): GeneratedComponent {
    const props: ComponentProp[] = [
      {
        name: "children",
        type: "React.ReactNode",
        defaultValue: `"${node.characters || ""}"`,
        required: false,
      },
      ...this.extractBasicProps(node),
    ];

    const styles = this.styleConverter.convertNodeToStyles(node);
    const jsx = this.generateTextJSX(node, props.length > 0);
    const code = this.generateComponentCode(componentName, props, jsx, styles);
    const stylesCode = this.styleConverter.stylesToEmotionCSS(styles);

    return {
      name: componentName,
      code,
      props,
      styles: stylesCode,
      isMainComponent: false,
    };
  }

  private generateVectorComponent(
    node: FigmaNode,
    componentName: string,
  ): GeneratedComponent {
    const props = this.extractBasicProps(node);
    const styles = this.styleConverter.convertNodeToStyles(node);

    // For vectors, we'll generate a placeholder SVG
    const jsx = this.generateVectorJSX(node, props.length > 0);
    const code = this.generateComponentCode(componentName, props, jsx, styles);
    const stylesCode = this.styleConverter.stylesToEmotionCSS(styles);

    return {
      name: componentName,
      code,
      props,
      styles: stylesCode,
      isMainComponent: false,
    };
  }

  private generateGenericComponent(
    node: FigmaNode,
    componentName: string,
  ): GeneratedComponent {
    const props = this.extractBasicProps(node);
    const styles = this.styleConverter.convertNodeToStyles(node);
    const children = this.generateChildrenCode(node);

    const jsx = this.generateJSX(node, children, props.length > 0);
    const code = this.generateComponentCode(componentName, props, jsx, styles);
    const stylesCode = this.styleConverter.stylesToEmotionCSS(styles);

    return {
      name: componentName,
      code,
      props,
      styles: stylesCode,
      isMainComponent: false,
    };
  }

  private generateChildrenCode(node: FigmaNode): string {
    if (!node.children || node.children.length === 0) {
      return "";
    }

    const childComponents = node.children
      .filter((child) => child.visible !== false)
      .map((child) => {
        const childComponent = this.transformNodeToReact(child);
        if (childComponent) {
          this.generatedComponents.push(childComponent);
          return `      <${childComponent.name} />`;
        }
        return "";
      })
      .filter(Boolean);

    return childComponents.length > 0
      ? "\n" + childComponents.join("\n") + "\n    "
      : "";
  }

  private generateJSX(
    node: FigmaNode,
    children: string,
    hasProps: boolean,
  ): string {
    const tag = this.getHTMLTag(node);
    const propsSpread = hasProps ? " {...props}" : "";

    if (children) {
      return `<${tag} css={styles}${propsSpread}>${children}</${tag}>`;
    } else {
      return `<${tag} css={styles}${propsSpread} />`;
    }
  }

  private generateTextJSX(node: FigmaNode, hasProps: boolean): string {
    const tag = this.getTextTag(node);
    const propsSpread = hasProps ? " {...props}" : "";

    return `<${tag} css={styles}${propsSpread}>{children || "${node.characters || ""}"}</${tag}>`;
  }

  private generateVectorJSX(node: FigmaNode, hasProps: boolean): string {
    const propsSpread = hasProps ? " {...props}" : "";
    const { width = 24, height = 24 } = node.absoluteBoundingBox || {};

    return `<svg css={styles} width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"${propsSpread}>
      {/* SVG tartalma itt jelenne meg */}
      <rect width="${width}" height="${height}" fill="currentColor" opacity="0.1" />
    </svg>`;
  }

  private getHTMLTag(node: FigmaNode): string {
    switch (node.type) {
      case "FRAME":
      case "GROUP":
      case "COMPONENT":
      case "INSTANCE":
        return "div";
      case "TEXT":
        return this.getTextTag(node);
      case "VECTOR":
      case "BOOLEAN_OPERATION":
        return "svg";
      default:
        return "div";
    }
  }

  private getTextTag(node: FigmaNode): string {
    if (!node.style) return "p";

    const fontSize = node.style.fontSize || 16;
    if (fontSize >= 32) return "h1";
    if (fontSize >= 24) return "h2";
    if (fontSize >= 20) return "h3";
    if (fontSize >= 18) return "h4";
    if (fontSize >= 16) return "h5";
    if (fontSize >= 14) return "h6";
    return "p";
  }

  private generateComponentCode(
    componentName: string,
    props: ComponentProp[],
    jsx: string,
    styles: Record<string, any>,
  ): string {
    const imports = [
      "import React from 'react';",
      "import { css } from '@emotion/react';",
    ];

    const propsInterface =
      props.length > 0 ? this.generatePropsInterface(componentName, props) : "";
    const propsParam = props.length > 0 ? `props: ${componentName}Props` : "";
    const stylesCode = this.styleConverter.stylesToEmotionCSS(styles);

    return `${imports.join("\n")}

${propsInterface}

const styles = css\`
${Object.entries(styles)
  .map(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    return `  ${cssKey}: ${value};`;
  })
  .join("\n")}
\`;

export const ${componentName}: React.FC${props.length > 0 ? `<${componentName}Props>` : ""} = (${propsParam}) => {
  return (
    ${jsx}
  );
};`;
  }

  private generatePropsInterface(
    componentName: string,
    props: ComponentProp[],
  ): string {
    const propLines = props.map((prop) => {
      const optional = prop.required ? "" : "?";
      return `  ${prop.name}${optional}: ${prop.type};`;
    });

    return `interface ${componentName}Props {
${propLines.join("\n")}
}`;
  }

  private extractComponentProps(node: FigmaNode): ComponentProp[] {
    const props: ComponentProp[] = [];

    // Add className prop for styling
    props.push({
      name: "className",
      type: "string",
      required: false,
    });

    // Add style prop for inline styles
    props.push({
      name: "style",
      type: "React.CSSProperties",
      required: false,
    });

    return props;
  }

  private extractInstanceProps(
    instance: FigmaNode,
    masterComponent: FigmaNode,
  ): ComponentProp[] {
    const props: ComponentProp[] = [];

    // Compare instance with master component to find overrides
    // This is a simplified version - in practice, you'd need more sophisticated comparison
    if (instance.overrides) {
      Object.entries(instance.overrides).forEach(([nodeId, override]) => {
        if (typeof override === "string") {
          props.push({
            name: "text",
            type: "string",
            defaultValue: `"${override}"`,
            required: false,
          });
        }
      });
    }

    return props;
  }

  private extractBasicProps(node: FigmaNode): ComponentProp[] {
    const props: ComponentProp[] = [];

    // Basic props that most components should have
    props.push({
      name: "className",
      type: "string",
      required: false,
    });

    props.push({
      name: "style",
      type: "React.CSSProperties",
      required: false,
    });

    return props;
  }

  private generateComponentName(name: string): string {
    // Clean the name and make it a valid React component name
    let cleanName = name.replace(/[^a-zA-Z0-9]/g, "").replace(/^\d+/, ""); // Remove leading numbers

    if (!cleanName) {
      cleanName = `Component${++this.componentCounter}`;
    }

    // Ensure it starts with uppercase
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }

  private extractDesignTokens(figmaFile: FigmaFile): DesignTokens {
    const designTokens: DesignTokens = {
      colors: {},
      typography: {},
      spacing: {},
      borderRadius: {},
      shadows: {},
    };

    // Extract design tokens from styles
    Object.entries(figmaFile.styles).forEach(([styleId, style]) => {
      const cleanName = style.name
        .toLowerCase()
        .replace(/\//g, "-")
        .replace(/\s+/g, "-");

      switch (style.styleType) {
        case "FILL":
          designTokens.colors[cleanName] = "#000000"; // Placeholder - would need actual color
          break;
        case "TEXT":
          designTokens.typography[cleanName] = {
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "1.5",
            fontFamily: "sans-serif",
          };
          break;
      }
    });

    return designTokens;
  }
}

export const figmaConverter = new FigmaConverter();
