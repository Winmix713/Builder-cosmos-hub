export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: Fill[];
  strokes?: Stroke[];
  effects?: Effect[];
  constraints?: LayoutConstraint;
  layoutAlign?: string;
  layoutGrow?: number;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;
  characters?: string;
  style?: TypeStyle;
  absoluteBoundingBox?: Rectangle;
  relativeTransform?: Transform;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  exportSettings?: ExportSetting[];
  blendMode?: string;
  opacity?: number;
  isMask?: boolean;
  visible?: boolean;
  backgroundColor?: Color;
  prototypeStartNodeID?: string;
  prototypeDevice?: PrototypeDevice;
  flowStartingPoints?: FlowStartingPoint[];
  componentPropertyDefinitions?: Record<string, ComponentPropertyDefinition>;
  componentPropertyReferences?: Record<string, string>;
  variantGroupProperties?: Record<string, VariantProperty>;
  componentSetId?: string;
  overrides?: Record<string, OverrideValue>;
}

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, Component>;
  componentSets: Record<string, ComponentSet>;
  schemaVersion: number;
  styles: Record<string, Style>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Fill {
  blendMode?: string;
  type: string;
  color?: Color;
  gradientHandlePositions?: Vector[];
  gradientStops?: ColorStop[];
  scaleMode?: string;
  imageTransform?: Transform;
  scalingFactor?: number;
  rotation?: number;
  imageRef?: string;
  filters?: ImageFilters;
  gifRef?: string;
  opacity?: number;
  visible?: boolean;
  boundVariables?: Record<string, VariableAlias>;
}

export interface Stroke {
  blendMode?: string;
  type: string;
  color?: Color;
  gradientHandlePositions?: Vector[];
  gradientStops?: ColorStop[];
  scaleMode?: string;
  imageTransform?: Transform;
  scalingFactor?: number;
  rotation?: number;
  imageRef?: string;
  filters?: ImageFilters;
  gifRef?: string;
  opacity?: number;
  visible?: boolean;
  boundVariables?: Record<string, VariableAlias>;
}

export interface Effect {
  type: string;
  visible?: boolean;
  radius?: number;
  color?: Color;
  blendMode?: string;
  offset?: Vector;
  spread?: number;
  showShadowBehindNode?: boolean;
  boundVariables?: Record<string, VariableAlias>;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Transform {
  0: number[];
  1: number[];
}

export interface Vector {
  x: number;
  y: number;
}

export interface ColorStop {
  position: number;
  color: Color;
}

export interface TypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  paragraphSpacing?: number;
  paragraphIndent?: number;
  listSpacing?: number;
  hangingPunctuation?: boolean;
  hangingList?: boolean;
  fontSize: number;
  textDecoration?: string;
  textCase?: string;
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightPercentFontSize?: number;
  lineHeightUnit?: string;
  fontWeight: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  textAutoResize?: string;
  textTruncation?: string;
  maxLines?: number;
  textStyleId?: string;
  fillStyleId?: string;
  hyperlink?: Hyperlink;
  opentypeFlags?: Record<string, number>;
  boundVariables?: Record<string, VariableAlias>;
}

export interface Component {
  key: string;
  name: string;
  description: string;
  documentationLinks: DocumentationLink[];
  remote: boolean;
  componentSetId?: string;
}

export interface ComponentSet {
  key: string;
  name: string;
  description: string;
  documentationLinks: DocumentationLink[];
  remote: boolean;
}

export interface Style {
  key: string;
  name: string;
  description: string;
  remote: boolean;
  styleType: string;
}

export interface DocumentationLink {
  uri: string;
}

export interface LayoutConstraint {
  vertical: string;
  horizontal: string;
}

export interface ExportSetting {
  suffix: string;
  format: string;
  constraint: Constraint;
}

export interface Constraint {
  type: string;
  value: number;
}

export interface PrototypeDevice {
  type: string;
  rotation: string;
}

export interface FlowStartingPoint {
  nodeId: string;
  name: string;
}

export interface ComponentPropertyDefinition {
  type: string;
  defaultValue: any;
  variantOptions?: string[];
}

export interface VariantProperty {
  values: string[];
}

export interface OverrideValue {
  type: string;
  value: any;
}

export interface Hyperlink {
  type: string;
  url?: string;
  nodeID?: string;
}

export interface VariableAlias {
  type: string;
  id: string;
}

export interface ImageFilters {
  exposure?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  highlights?: number;
  shadows?: number;
}

export interface ConversionOptions {
  componentNamingConvention: "camelCase" | "PascalCase" | "kebab-case";
  propNamingConvention: "camelCase" | "snake_case";
  generateTests: boolean;
  generateStorybook: boolean;
  extractDesignTokens: boolean;
  optimizeAssets: boolean;
  includeAccessibility: boolean;
  cssFramework: "tailwind" | "styled-components" | "css-modules";
  outputFormat: "components" | "full-project";
}

export interface ConversionResult {
  success: boolean;
  components: GeneratedComponent[];
  designTokens?: DesignTokens;
  assets: GeneratedAsset[];
  errors: string[];
  warnings: string[];
}

export interface GeneratedComponent {
  name: string;
  code: string;
  props: ComponentProp[];
  dependencies: string[];
  tests?: string;
  storybook?: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, TypeToken>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  breakpoints: Record<string, string>;
}

export interface TypeToken {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  fontFamily: string;
}

export interface GeneratedAsset {
  name: string;
  url: string;
  type: "svg" | "png" | "jpg" | "gif";
  optimized: boolean;
}
