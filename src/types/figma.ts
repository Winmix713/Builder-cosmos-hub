export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: Fill[];
  strokes?: Stroke[];
  effects?: Effect[];

  // Layout properties
  layoutMode?: "HORIZONTAL" | "VERTICAL" | "NONE";
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems?: "MIN" | "CENTER" | "MAX";

  // Visual properties
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  opacity?: number;
  blendMode?: string;
  visible?: boolean;

  // Text properties
  characters?: string;
  style?: TypeStyle;
  textStyleId?: string;
  fillStyleId?: string;

  // Component properties
  componentId?: string;
  componentPropertyReferences?: Record<string, string>;
  overrides?: Record<string, any>;

  // Geometry
  absoluteBoundingBox?: Rectangle;
  relativeTransform?: Transform;

  // Vector properties
  vectorPaths?: VectorPath[];
  vectorNetwork?: VectorNetwork;
}

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, Component>;
  componentSets: Record<string, ComponentSet>;
  styles: Record<string, Style>;
  name: string;
  lastModified: string;
  version: string;
}

export interface Fill {
  type:
    | "SOLID"
    | "GRADIENT_LINEAR"
    | "GRADIENT_RADIAL"
    | "GRADIENT_ANGULAR"
    | "GRADIENT_DIAMOND"
    | "IMAGE";
  color?: Color;
  opacity?: number;
  visible?: boolean;
  blendMode?: string;
  gradientHandlePositions?: Vector[];
  gradientStops?: ColorStop[];
  imageRef?: string;
  imageTransform?: Transform;
  scaleMode?: string;
}

export interface Stroke {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL";
  color?: Color;
  opacity?: number;
  visible?: boolean;
  thickness?: number;
  blendMode?: string;
}

export interface Effect {
  type: "INNER_SHADOW" | "DROP_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
  visible?: boolean;
  radius?: number;
  color?: Color;
  blendMode?: string;
  offset?: Vector;
  spread?: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface ColorStop {
  position: number;
  color: Color;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Transform {
  0: [number, number, number];
  1: [number, number, number];
}

export interface TypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  textAlignHorizontal?: "LEFT" | "RIGHT" | "CENTER" | "JUSTIFIED";
  textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
  textDecoration?: string;
  textCase?: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
}

export interface Component {
  key: string;
  name: string;
  description: string;
  remote: boolean;
  componentSetId?: string;
}

export interface ComponentSet {
  key: string;
  name: string;
  description: string;
  remote: boolean;
}

export interface Style {
  key: string;
  name: string;
  description: string;
  remote: boolean;
  styleType: "FILL" | "TEXT" | "EFFECT" | "GRID";
}

export interface VectorPath {
  windingRule: string;
  data: string;
}

export interface VectorNetwork {
  vertices: Vector[];
  edges: any[];
  regions: any[];
}

export interface GeneratedComponent {
  name: string;
  code: string;
  props: ComponentProp[];
  styles: string;
  isMainComponent: boolean;
}

export interface ComponentProp {
  name: string;
  type: string;
  defaultValue?: any;
  required: boolean;
}

export interface ConversionResult {
  success: boolean;
  components: GeneratedComponent[];
  designTokens: DesignTokens;
  errors: string[];
  warnings: string[];
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, TypeToken>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

export interface TypeToken {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  fontFamily: string;
  letterSpacing?: string;
}
