import {
  FigmaNode,
  ConversionOptions,
  ConversionResult,
  GeneratedComponent,
  ComponentProp,
} from "@/types/figma";
import { styleTransformer } from "./styleTransformer";

export class DesignConverter {
  private options: ConversionOptions;
  private componentCounter = 0;
  private generatedComponents: GeneratedComponent[] = [];
  private imports = new Set<string>();

  constructor(options: ConversionOptions) {
    this.options = options;
  }

  async convertDesign(node: FigmaNode): Promise<ConversionResult> {
    try {
      this.componentCounter = 0;
      this.generatedComponents = [];
      this.imports.clear();

      // Extract design tokens if enabled
      const designTokens = this.options.extractDesignTokens
        ? styleTransformer.extractDesignTokens(node)
        : undefined;

      // Convert the main node
      const mainComponent = this.convertNode(node, true);

      if (mainComponent) {
        this.generatedComponents.push(mainComponent);
      }

      return {
        success: true,
        components: this.generatedComponents,
        designTokens,
        assets: [],
        errors: [],
        warnings: [],
      };
    } catch (error) {
      return {
        success: false,
        components: [],
        assets: [],
        errors: [
          error instanceof Error ? error.message : "Unknown error occurred",
        ],
        warnings: [],
      };
    }
  }

  private convertNode(
    node: FigmaNode,
    isRoot = false,
  ): GeneratedComponent | null {
    const componentName = this.generateComponentName(node.name);
    const props = this.extractProps(node);
    const styles = this.generateStyles(node);
    const children = this.generateChildren(node);

    const jsx = this.generateJSX(node, componentName, styles, children, isRoot);
    const code = this.generateComponentCode(componentName, props, jsx);

    return {
      name: componentName,
      code,
      props,
      dependencies: Array.from(this.imports),
      tests: this.options.generateTests
        ? this.generateTests(componentName, props)
        : undefined,
      storybook: this.options.generateStorybook
        ? this.generateStorybook(componentName, props)
        : undefined,
    };
  }

  private generateComponentName(name: string): string {
    let cleanName = name.replace(/[^a-zA-Z0-9]/g, "");

    if (!cleanName || /^\d/.test(cleanName)) {
      cleanName = `Component${++this.componentCounter}`;
    }

    switch (this.options.componentNamingConvention) {
      case "camelCase":
        return cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
      case "PascalCase":
        return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      case "kebab-case":
        return cleanName
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()
          .replace(/^-/, "");
      default:
        return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
  }

  private extractProps(node: FigmaNode): ComponentProp[] {
    const props: ComponentProp[] = [];

    // Add common props
    if (node.visible === false) {
      props.push({
        name: "hidden",
        type: "boolean",
        required: false,
        defaultValue: false,
        description: "Whether the component is hidden",
      });
    }

    // Add text content prop for text nodes
    if (node.type === "TEXT" && node.characters) {
      props.push({
        name: "children",
        type: "React.ReactNode",
        required: false,
        defaultValue: `"${node.characters}"`,
        description: "Text content",
      });
    }

    // Add className prop for styling
    props.push({
      name: "className",
      type: "string",
      required: false,
      description: "Additional CSS classes",
    });

    // Add onClick prop for interactive elements
    if (this.isInteractiveElement(node)) {
      props.push({
        name: "onClick",
        type: "() => void",
        required: false,
        description: "Click handler",
      });
    }

    return props;
  }

  private isInteractiveElement(node: FigmaNode): boolean {
    const interactiveTypes = [
      "FRAME",
      "RECTANGLE",
      "ELLIPSE",
      "POLYGON",
      "STAR",
      "VECTOR",
    ];
    return (
      interactiveTypes.includes(node.type) &&
      (node.name.toLowerCase().includes("button") ||
        node.name.toLowerCase().includes("link") ||
        node.name.toLowerCase().includes("click"))
    );
  }

  private generateStyles(node: FigmaNode): string {
    const styles: string[] = [];

    // Base styles based on node type
    switch (node.type) {
      case "FRAME":
        styles.push("flex");
        break;
      case "TEXT":
        styles.push("text-left");
        break;
      case "RECTANGLE":
        styles.push("block");
        break;
    }

    // Layout styles
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;

      // Convert to responsive classes
      if (width) {
        if (width <= 100) styles.push("w-24");
        else if (width <= 200) styles.push("w-48");
        else if (width <= 300) styles.push("w-72");
        else if (width <= 400) styles.push("w-96");
        else styles.push("w-full");
      }

      if (height) {
        if (height <= 50) styles.push("h-12");
        else if (height <= 100) styles.push("h-24");
        else if (height <= 200) styles.push("h-48");
        else if (height <= 300) styles.push("h-72");
        else styles.push("h-auto");
      }
    }

    // Background styles from fills
    if (node.fills && node.fills.length > 0) {
      const primaryFill = node.fills[0];
      if (primaryFill.color && primaryFill.visible !== false) {
        const color = styleTransformer.colorToHex(primaryFill.color);
        styles.push(this.getColorClass("bg", color));
      }
    }

    // Border radius
    if (node.cornerRadius !== undefined && node.cornerRadius > 0) {
      if (node.cornerRadius <= 4) styles.push("rounded");
      else if (node.cornerRadius <= 8) styles.push("rounded-md");
      else if (node.cornerRadius <= 12) styles.push("rounded-lg");
      else if (node.cornerRadius <= 16) styles.push("rounded-xl");
      else styles.push("rounded-2xl");
    }

    // Typography styles
    if (node.style && node.type === "TEXT") {
      const { fontSize, fontWeight } = node.style;

      // Font size
      if (fontSize <= 12) styles.push("text-xs");
      else if (fontSize <= 14) styles.push("text-sm");
      else if (fontSize <= 16) styles.push("text-base");
      else if (fontSize <= 18) styles.push("text-lg");
      else if (fontSize <= 20) styles.push("text-xl");
      else if (fontSize <= 24) styles.push("text-2xl");
      else if (fontSize <= 30) styles.push("text-3xl");
      else styles.push("text-4xl");

      // Font weight
      if (fontWeight <= 300) styles.push("font-light");
      else if (fontWeight <= 400) styles.push("font-normal");
      else if (fontWeight <= 500) styles.push("font-medium");
      else if (fontWeight <= 600) styles.push("font-semibold");
      else if (fontWeight <= 700) styles.push("font-bold");
      else styles.push("font-extrabold");
    }

    // Effects (shadows)
    if (node.effects && node.effects.length > 0) {
      const shadowEffect = node.effects.find(
        (effect) => effect.type === "DROP_SHADOW" && effect.visible !== false,
      );
      if (shadowEffect) {
        styles.push("shadow-md");
      }
    }

    // Padding and margin (basic heuristics)
    if (node.type === "FRAME" && node.children && node.children.length > 0) {
      styles.push("p-4");
    }

    return styles.join(" ");
  }

  private getColorClass(prefix: string, hex: string): string {
    const colorMap: Record<string, string> = {
      "#000000": `${prefix}-black`,
      "#ffffff": `${prefix}-white`,
      "#f3f4f6": `${prefix}-gray-100`,
      "#e5e7eb": `${prefix}-gray-200`,
      "#3b82f6": `${prefix}-blue-500`,
      "#ef4444": `${prefix}-red-500`,
      "#10b981": `${prefix}-green-500`,
      "#f59e0b": `${prefix}-yellow-500`,
      "#8b5cf6": `${prefix}-purple-500`,
    };

    return colorMap[hex.toLowerCase()] || `${prefix}-gray-500`;
  }

  private generateChildren(node: FigmaNode): string {
    if (!node.children || node.children.length === 0) {
      if (node.type === "TEXT" && node.characters) {
        return `{children || "${node.characters}"}`;
      }
      return "";
    }

    const childComponents = node.children
      .filter((child) => child.visible !== false)
      .map((child) => {
        const childName = this.generateComponentName(child.name);
        const childStyles = this.generateStyles(child);
        const childChildren = this.generateChildren(child);

        return this.generateJSX(child, childName, childStyles, childChildren);
      })
      .join("\n        ");

    return childComponents;
  }

  private generateJSX(
    node: FigmaNode,
    componentName: string,
    styles: string,
    children: string,
    isRoot = false,
  ): string {
    const tag = this.getHtmlTag(node);
    const props = this.generateJSXProps(node, styles);

    if (isRoot) {
      return `<${tag}${props}>
        ${children}
      </${tag}>`;
    }

    if (children) {
      return `<${tag}${props}>
          ${children}
        </${tag}>`;
    }

    return `<${tag}${props} />`;
  }

  private getHtmlTag(node: FigmaNode): string {
    switch (node.type) {
      case "TEXT":
        // Determine appropriate text tag based on style
        if (node.style) {
          const fontSize = node.style.fontSize;
          if (fontSize >= 32) return "h1";
          if (fontSize >= 24) return "h2";
          if (fontSize >= 20) return "h3";
          if (fontSize >= 18) return "h4";
          if (fontSize >= 16) return "h5";
          if (fontSize >= 14) return "h6";
        }
        return "p";

      case "FRAME":
        // Check if it's likely a button or link
        if (this.isInteractiveElement(node)) {
          return "button";
        }
        return "div";

      case "RECTANGLE":
      case "ELLIPSE":
        return this.isInteractiveElement(node) ? "button" : "div";

      case "VECTOR":
      case "STAR":
      case "POLYGON":
        return "svg";

      default:
        return "div";
    }
  }

  private generateJSXProps(node: FigmaNode, styles: string): string {
    const props: string[] = [];

    if (styles) {
      props.push(`className={cn("${styles}", className)}`);
    } else {
      props.push("className={className}");
    }

    if (this.isInteractiveElement(node)) {
      props.push("onClick={onClick}");
    }

    if (node.visible === false) {
      props.push("hidden={hidden}");
    }

    // Add accessibility attributes if enabled
    if (this.options.includeAccessibility) {
      if (this.isInteractiveElement(node)) {
        props.push('role="button"');
        props.push("tabIndex={0}");
      }

      if (node.type === "TEXT" && node.characters) {
        props.push(`aria-label="${node.characters}"`);
      }
    }

    return props.length > 0 ? ` ${props.join(" ")}` : "";
  }

  private generateComponentCode(
    componentName: string,
    props: ComponentProp[],
    jsx: string,
  ): string {
    this.imports.add("import React from 'react';");
    this.imports.add("import { cn } from '@/lib/utils';");

    const interfaceName = `${componentName}Props`;
    const propsInterface = this.generatePropsInterface(interfaceName, props);
    const propsParam =
      props.length > 0
        ? `{ ${props.map((p) => p.name).join(", ")} }: ${interfaceName}`
        : "";

    return `${Array.from(this.imports).join("\n")}

${propsInterface}

export function ${componentName}(${propsParam}) {
  return (
    ${jsx}
  );
}`;
  }

  private generatePropsInterface(
    interfaceName: string,
    props: ComponentProp[],
  ): string {
    if (props.length === 0) return "";

    const propLines = props.map((prop) => {
      const optional = prop.required ? "" : "?";
      const comment = prop.description ? `  /** ${prop.description} */\n` : "";
      return `${comment}  ${prop.name}${optional}: ${prop.type};`;
    });

    return `interface ${interfaceName} {
${propLines.join("\n")}
}`;
  }

  private generateTests(componentName: string, props: ComponentProp[]): string {
    this.imports.add(
      "import { render, screen } from '@testing-library/react';",
    );
    this.imports.add(`import { ${componentName} } from './${componentName}';`);

    return `describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<${componentName} className={customClass} />);
    const element = screen.getByRole('button');
    expect(element).toHaveClass(customClass);
  });
});`;
  }

  private generateStorybook(
    componentName: string,
    props: ComponentProp[],
  ): string {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};`;
  }
}
