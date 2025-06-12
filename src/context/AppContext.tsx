import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { ConversionOptions, ConversionResult } from "@/types/figma";

interface AppState {
  figmaUrl: string;
  accessToken: string;
  isConverting: boolean;
  conversionProgress: number;
  conversionStatus: string;
  conversionOptions: ConversionOptions;
  conversionResult: ConversionResult | null;
  selectedComponent: string | null;
  theme: "light" | "dark";
  showConfigPanel: boolean;
}

type AppAction =
  | { type: "SET_FIGMA_URL"; payload: string }
  | { type: "SET_ACCESS_TOKEN"; payload: string }
  | { type: "SET_CONVERTING"; payload: boolean }
  | { type: "SET_CONVERSION_PROGRESS"; payload: number }
  | { type: "SET_CONVERSION_STATUS"; payload: string }
  | { type: "SET_CONVERSION_OPTIONS"; payload: Partial<ConversionOptions> }
  | { type: "SET_CONVERSION_RESULT"; payload: ConversionResult | null }
  | { type: "SET_SELECTED_COMPONENT"; payload: string | null }
  | { type: "TOGGLE_THEME" }
  | { type: "TOGGLE_CONFIG_PANEL" }
  | { type: "RESET_STATE" };

const initialState: AppState = {
  figmaUrl: "",
  accessToken: "",
  isConverting: false,
  conversionProgress: 0,
  conversionStatus: "Ready to convert",
  conversionOptions: {
    componentNamingConvention: "PascalCase",
    propNamingConvention: "camelCase",
    generateTests: false,
    generateStorybook: false,
    extractDesignTokens: true,
    optimizeAssets: true,
    includeAccessibility: true,
    cssFramework: "tailwind",
    outputFormat: "components",
  },
  conversionResult: null,
  selectedComponent: null,
  theme: "light",
  showConfigPanel: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_FIGMA_URL":
      return { ...state, figmaUrl: action.payload };
    case "SET_ACCESS_TOKEN":
      return { ...state, accessToken: action.payload };
    case "SET_CONVERTING":
      return { ...state, isConverting: action.payload };
    case "SET_CONVERSION_PROGRESS":
      return { ...state, conversionProgress: action.payload };
    case "SET_CONVERSION_STATUS":
      return { ...state, conversionStatus: action.payload };
    case "SET_CONVERSION_OPTIONS":
      return {
        ...state,
        conversionOptions: { ...state.conversionOptions, ...action.payload },
      };
    case "SET_CONVERSION_RESULT":
      return { ...state, conversionResult: action.payload };
    case "SET_SELECTED_COMPONENT":
      return { ...state, selectedComponent: action.payload };
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    case "TOGGLE_CONFIG_PANEL":
      return { ...state, showConfigPanel: !state.showConfigPanel };
    case "RESET_STATE":
      return {
        ...initialState,
        theme: state.theme,
        conversionOptions: state.conversionOptions,
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
