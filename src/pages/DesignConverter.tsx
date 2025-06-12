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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Moon, Sun, Download, Play, Settings, Eye, Figma } from "lucide-react";
import { CodeDisplay } from "@/components/CodeDisplay";
import { ConfigPanel } from "@/components/ConfigPanel";
import { useAppContext } from "@/context/AppContext";
import { useFigmaConverter } from "@/hooks/useFigmaConverter";

// Component Preview placeholder
const ComponentPreview = ({ className }: { className?: string }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Component Preview</CardTitle>
      <CardDescription>Live preview of generated components</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
        <div className="text-center space-y-2 text-muted-foreground">
          <Eye className="w-12 h-12 mx-auto opacity-50" />
          <p>Preview will be available soon</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Progress Indicator placeholder
const ProgressIndicator = ({ className }: { className?: string }) => {
  const { state } = useAppContext();

  if (!state.isConverting) return null;

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {state.conversionStatus}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.conversionProgress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DesignConverter = () => {
  const { state, dispatch } = useAppContext();
  const { convertDesign, error } = useFigmaConverter();

  const handleConvert = async () => {
    if (!state.figmaUrl || !state.accessToken) {
      return;
    }
    await convertDesign();
  };

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  const toggleConfig = () => {
    dispatch({ type: "TOGGLE_CONFIG_PANEL" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Figma className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Figma to React Converter
              </h1>
              <p className="text-sm text-muted-foreground">
                Transform your Figma designs into production-ready React
                components
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleConfig}>
              <Settings className="w-4 h-4 mr-2" />
              Config
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {state.theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <Card className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Design Input</CardTitle>
            <CardDescription>
              Enter your Figma file URL and personal access token to begin
              conversion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="figma-url">Figma File URL</Label>
              <Input
                id="figma-url"
                type="url"
                placeholder="https://www.figma.com/file/..."
                value={state.figmaUrl}
                onChange={(e) =>
                  dispatch({ type: "SET_FIGMA_URL", payload: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-token">Personal Access Token</Label>
              <Input
                id="access-token"
                type="password"
                placeholder="figd_..."
                value={state.accessToken}
                onChange={(e) =>
                  dispatch({
                    type: "SET_ACCESS_TOKEN",
                    payload: e.target.value,
                  })
                }
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleConvert}
              disabled={
                !state.figmaUrl || !state.accessToken || state.isConverting
              }
              className="w-full"
            >
              {state.isConverting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Converting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Convert Design
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Configuration Panel */}
        {state.showConfigPanel && (
          <ConfigPanel className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-0 shadow-xl" />
        )}

        {/* Progress Indicator */}
        {state.isConverting && (
          <ProgressIndicator className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-0 shadow-xl" />
        )}

        {/* Results Section */}
        {state.conversionResult && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Code Output */}
            <Card className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Code</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {state.conversionResult.components.length} Components
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="components" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="styles">Styles</TabsTrigger>
                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                  </TabsList>
                  <TabsContent value="components">
                    <CodeDisplay />
                  </TabsContent>
                  <TabsContent value="styles">
                    <div className="p-4 text-center text-muted-foreground">
                      Style extraction results will appear here
                    </div>
                  </TabsContent>
                  <TabsContent value="tokens">
                    <div className="p-4 text-center text-muted-foreground">
                      Design tokens will appear here
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Component Preview */}
            <Card className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Component Preview</CardTitle>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Full Preview
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ComponentPreview />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignConverter;
