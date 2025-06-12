import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Figma,
  Play,
  AlertCircle,
  CheckCircle,
  Eye,
  Code2,
} from "lucide-react";
import { figmaService } from "@/services/figmaService";
import { figmaConverter } from "@/core/converter";
import { ConversionResult, GeneratedComponent } from "@/types/figma";
import { CodeDisplay } from "@/components/CodeDisplay";
import { ComponentPreview } from "@/components/ComponentPreview";
import { ProgressIndicator } from "@/components/ProgressIndicator";

interface AppState {
  figmaUrl: string;
  accessToken: string;
  isConverting: boolean;
  progress: number;
  status: string;
  result: ConversionResult | null;
  selectedComponent: GeneratedComponent | null;
  error: string;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    figmaUrl: "",
    accessToken: "",
    isConverting: false,
    progress: 0,
    status: "",
    result: null,
    selectedComponent: null,
    error: "",
  });

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const updateProgress = (progress: number, status: string) => {
    updateState({ progress, status });
  };

  const handleConvert = async () => {
    if (!state.figmaUrl.trim() || !state.accessToken.trim()) {
      updateState({
        error: "Kérjük, adja meg a Figma URL-t és az access tokent.",
      });
      return;
    }

    updateState({
      isConverting: true,
      error: "",
      result: null,
      selectedComponent: null,
      progress: 0,
      status: "Konverzió indítása...",
    });

    try {
      // Demo mód ellenőrzése
      const isDemoMode =
        state.figmaUrl.includes("demo") ||
        state.figmaUrl.includes("test") ||
        state.figmaUrl.includes("example") ||
        state.accessToken === "demo" ||
        state.accessToken === "test";

      if (isDemoMode) {
        // Mock konverzió demo célokra
        updateProgress(20, "Demo mód - Mock komponensek generálása...");
        await new Promise((resolve) => setTimeout(resolve, 800));

        updateProgress(60, "Komponensek feldolgozása...");
        await new Promise((resolve) => setTimeout(resolve, 600));

        const { mockConverter } = await import("@/core/mockConverter");
        const result = await mockConverter.convertMockDesign();

        updateProgress(100, "Demo konverzió befejezve!");

        const selectedComponent =
          result.components.length > 0 ? result.components[0] : null;

        updateState({
          result,
          selectedComponent,
          isConverting: false,
        });
        return;
      }

      // Valódi Figma API konverzió
      updateProgress(10, "Figma fájl adatok lekérése...");

      const fileKey = figmaService.extractFileKey(state.figmaUrl);
      const nodeIds = figmaService.extractNodeIds(state.figmaUrl);

      let figmaFile;
      if (nodeIds.length > 0) {
        updateProgress(30, "Kiválasztott elemek lekérése...");
        const nodesResponse = await figmaService.getFileNodes(
          fileKey,
          nodeIds,
          state.accessToken,
        );
        // Create a mock file structure for nodes
        figmaFile = {
          document: {
            id: "document",
            name: "Document",
            type: "DOCUMENT",
            children: Object.values(nodesResponse.nodes),
          },
          components: {},
          componentSets: {},
          styles: {},
          name: "Figma Import",
          lastModified: new Date().toISOString(),
          version: "1.0",
        };
      } else {
        updateProgress(30, "Teljes fájl lekérése...");
        figmaFile = await figmaService.fetchFigmaFile(
          fileKey,
          state.accessToken,
        );
      }

      updateProgress(50, "Design elemzése...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      updateProgress(70, "React komponensek generálása...");
      const result = await figmaConverter.convertFigmaFile(figmaFile);

      updateProgress(90, "Kód optimalizálása...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      updateProgress(100, "Konverzió befejezve!");

      // Set the first component as selected
      const selectedComponent =
        result.components.length > 0 ? result.components[0] : null;

      updateState({
        result,
        selectedComponent,
        isConverting: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ismeretlen hiba történt";
      updateState({
        error: errorMessage,
        isConverting: false,
        progress: 0,
        status: "",
      });
    }
  };

  const handleComponentSelect = (component: GeneratedComponent) => {
    updateState({ selectedComponent: component });
  };

  const isValidFigmaUrl = (url: string) => {
    return /^https:\/\/(www\.)?figma\.com\/(file|design)\/[a-zA-Z0-9]+/.test(
      url,
    );
  };

  const canConvert =
    state.figmaUrl.trim() &&
    state.accessToken.trim() &&
    isValidFigmaUrl(state.figmaUrl) &&
    !state.isConverting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131316] via-[#1a1a1f] to-[#2a2a30]">
      {/* Header */}
      <header className="border-b border-[#616266]/30 bg-[#131316]/90 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#616266] rounded-xl flex items-center justify-center shadow-lg shadow-[#131316]/50 relative">
              <div className="absolute inset-0 bg-[#131316] rounded-xl opacity-75 mix-blend-soft-light"></div>
              <Figma className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white/90">
                Figma → React Konverter
              </h1>
              <p className="text-sm text-[#616266]">
                Alakítsa át Figma designjait production-ready React
                komponensekké CSS-in-JS használatával
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Input Section */}
          <Card className="bg-[#616266]/20 backdrop-blur-sm border border-[#616266]/30 shadow-2xl shadow-[#131316]/50 relative">
            <div className="absolute inset-0 bg-[#131316]/75 rounded-lg mix-blend-soft-light pointer-events-none"></div>
            <CardHeader>
              <CardTitle className="text-white/90 relative z-10">
                Design Input
              </CardTitle>
              <CardDescription className="text-[#616266] relative z-10">
                Adja meg a Figma fájl URL-jét és personal access token-jét a
                konverzió megkezdéséhez
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="figma-url"
                    className="text-white/80 relative z-10"
                  >
                    Figma Fájl URL
                  </Label>
                  <Input
                    id="figma-url"
                    type="url"
                    placeholder="https://www.figma.com/file/..."
                    value={state.figmaUrl}
                    onChange={(e) => updateState({ figmaUrl: e.target.value })}
                    className={
                      !isValidFigmaUrl(state.figmaUrl) && state.figmaUrl
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {state.figmaUrl && !isValidFigmaUrl(state.figmaUrl) && (
                    <p className="text-sm text-red-600">
                      Érvényes Figma URL-t adjon meg
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="access-token"
                    className="text-white/80 relative z-10"
                  >
                    Personal Access Token
                  </Label>
                  <Input
                    id="access-token"
                    type="password"
                    placeholder="figd_..."
                    value={state.accessToken}
                    onChange={(e) =>
                      updateState({ accessToken: e.target.value })
                    }
                  />
                  <p className="text-xs text-[#616266] relative z-10">
                    Hozzon létre tokent a Figma fiók beállításokban.{" "}
                    <a
                      href="https://www.figma.com/developers/api#access-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white hover:underline"
                    >
                      Útmutató →
                    </a>
                  </p>
                  <div className="mt-3 p-3 bg-[#616266]/10 border border-[#616266]/20 rounded-lg relative z-10">
                    <p className="text-xs text-white/60 mb-2">
                      💡 <strong>Demo mód:</strong> Próbálja ki az alkalmazást
                      demo adatokkal:
                    </p>
                    <div className="space-y-1 text-xs">
                      <p className="text-[#616266]">
                        URL:{" "}
                        <span className="text-white/70 font-mono">
                          https://figma.com/demo
                        </span>
                      </p>
                      <p className="text-[#616266]">
                        Token:{" "}
                        <span className="text-white/70 font-mono">demo</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleConvert}
                disabled={!canConvert}
                className="w-full bg-[#616266] hover:bg-[#6a6b70] shadow-lg shadow-[#131316]/50 text-white border border-[#616266]/50 relative z-10 transition-all duration-300 hover:shadow-xl hover:shadow-[#131316]/70"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                {state.isConverting ? "Konvertálás..." : "Kód Generálása"}
              </Button>

              {state.result && state.result.success && (
                <Alert className="bg-[#616266]/20 border-[#616266]/40 relative z-10">
                  <div className="absolute inset-0 bg-[#131316]/30 rounded mix-blend-soft-light pointer-events-none"></div>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-white/80 relative z-10">
                    Sikeresen generálva {state.result.components.length}{" "}
                    komponens! Emotion CSS-in-JS stílusokkal.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          {state.isConverting && (
            <ProgressIndicator
              progress={state.progress}
              status={state.status}
              className="bg-[#616266]/20 backdrop-blur-sm border border-[#616266]/30 shadow-2xl shadow-[#131316]/50 relative overflow-hidden"
            />
          )}

          {/* Results Section */}
          {state.result && state.result.success && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Generated Code */}
              <CodeDisplay
                components={state.result.components}
                designTokens={state.result.designTokens}
                selectedComponent={state.selectedComponent || undefined}
                onComponentSelect={handleComponentSelect}
                className="bg-[#616266]/20 backdrop-blur-sm border border-[#616266]/30 shadow-2xl shadow-[#131316]/50 relative overflow-hidden"
                theme="dark"
              />

              {/* Component Preview */}
              <Card className="bg-[#616266]/20 backdrop-blur-sm border border-[#616266]/30 shadow-2xl shadow-[#131316]/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#131316]/75 rounded-lg mix-blend-soft-light pointer-events-none"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      <CardTitle className="text-white/90 relative z-10">
                        Komponens Előnézet
                      </CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Code2 className="w-4 h-4 mr-2" />
                      Teljes Előnézet
                    </Button>
                  </div>
                  <CardDescription className="text-[#616266] relative z-10">
                    A generált komponens vizuális megjelenítése
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComponentPreview
                    component={state.selectedComponent || undefined}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features Info */}
          {!state.result && !state.isConverting && (
            <Card className="bg-[#616266]/20 backdrop-blur-sm border border-[#616266]/30 shadow-2xl shadow-[#131316]/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#131316]/75 rounded-lg mix-blend-soft-light pointer-events-none"></div>
              <CardHeader>
                <CardTitle className="text-lg text-white/90 relative z-10">
                  Mit kap?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-white/80">
                        TypeScript React komponensek
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-white/80">
                        Emotion CSS-in-JS stílusok
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-white/80">
                        Auto Layout → Flexbox konverzió
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-white/80">
                        Komponens props generálás
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-white/80">
                        Design tokenek kinyerése
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-white/80">
                        SVG ikonok beépítése
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-white/80">
                        Újrafelhasználható komponensek
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-white/80">
                        Tiszta, karbantartható kód
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
