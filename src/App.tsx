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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Figma,
  Play,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Eye,
} from "lucide-react";
import { figmaService } from "@/services/figmaService";
import { figmaConverter } from "@/core/converter";
import { ConversionResult } from "@/types/figma";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface AppState {
  figmaUrl: string;
  accessToken: string;
  isConverting: boolean;
  progress: number;
  status: string;
  result: ConversionResult | null;
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
      progress: 0,
      status: "Konverzió indítása...",
    });

    try {
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

      // Small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 500));

      updateProgress(70, "React komponensek generálása...");

      const result = await figmaConverter.convertFigmaFile(figmaFile);

      updateProgress(90, "Kód optimalizálása...");

      // Another small delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      updateProgress(100, "Konverzió befejezve!");

      updateState({ result, isConverting: false });
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Másolás sikertelen:", error);
    }
  };

  const downloadCode = (component: any) => {
    const element = document.createElement("a");
    const file = new Blob([component.code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${component.name}.tsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Figma className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Figma → React Konverter
              </h1>
              <p className="text-sm text-muted-foreground">
                Alakítsa át Figma designjait production-ready React
                komponensekké
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Input Section */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Design Input</CardTitle>
              <CardDescription>
                Adja meg a Figma fájl URL-jét és personal access token-jét a
                konverzió megkezdéséhez
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="figma-url">Figma Fájl URL</Label>
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
                  <Label htmlFor="access-token">Personal Access Token</Label>
                  <Input
                    id="access-token"
                    type="password"
                    placeholder="figd_..."
                    value={state.accessToken}
                    onChange={(e) =>
                      updateState({ accessToken: e.target.value })
                    }
                  />
                </div>
              </div>

              {state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              {state.isConverting && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    {state.status}
                  </div>
                  <Progress value={state.progress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleConvert}
                disabled={!canConvert}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                {state.isConverting ? "Konvertálás..." : "Kód Generálása"}
              </Button>

              {state.result && state.result.success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sikeresen generálva {state.result.components.length}{" "}
                    komponens!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {state.result && state.result.success && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Generated Code */}
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generált Kód</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Letöltés
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="components" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="components">Komponensek</TabsTrigger>
                      <TabsTrigger value="tokens">Design Tokenek</TabsTrigger>
                    </TabsList>

                    <TabsContent value="components" className="mt-4">
                      {state.result.components.length > 0 && (
                        <div className="space-y-4">
                          {state.result.components.map((component, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">
                                  {component.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(component.code)
                                    }
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadCode(component)}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="rounded-lg overflow-hidden border">
                                <SyntaxHighlighter
                                  language="tsx"
                                  style={oneDark}
                                  customStyle={{
                                    margin: 0,
                                    fontSize: "14px",
                                    maxHeight: "400px",
                                  }}
                                >
                                  {component.code}
                                </SyntaxHighlighter>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="tokens" className="mt-4">
                      <div className="rounded-lg overflow-hidden border">
                        <SyntaxHighlighter
                          language="css"
                          style={oneDark}
                          customStyle={{
                            margin: 0,
                            fontSize: "14px",
                            maxHeight: "400px",
                          }}
                        >
                          {JSON.stringify(state.result.designTokens, null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Live Preview */}
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Élő Előnézet</CardTitle>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Teljes Előnézet
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center space-y-2 text-muted-foreground">
                      <Eye className="w-12 h-12 mx-auto opacity-50" />
                      <p>Az élő előnézet hamarosan elérhető lesz</p>
                      <p className="text-sm">
                        A komponensek előnézete egy későbbi frissítésben lesz
                        elérhető
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
