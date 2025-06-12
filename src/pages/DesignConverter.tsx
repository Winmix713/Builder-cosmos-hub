import React, { useState } from "react";
import {
  Figma,
  Zap,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConfigPanel } from "@/components/ConfigPanel";
import { CodeDisplay } from "@/components/CodeDisplay";
import { useAppContext } from "@/context/AppContext";
import { useFigmaConverter } from "@/hooks/useFigmaConverter";
import { cn } from "@/lib/utils";

export default function DesignConverter() {
  const { state, dispatch } = useAppContext();
  const { convertDesign, error, isConverting, progress, status } =
    useFigmaConverter();
  const [tokenVisible, setTokenVisible] = useState(false);

  const handleConvert = async () => {
    if (!state.figmaUrl.trim() || !state.accessToken.trim()) {
      return;
    }
    await convertDesign();
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
    !isConverting;

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
                Figma to React
              </h1>
              <p className="text-sm text-muted-foreground">
                Convert designs to production-ready code
              </p>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
          {/* Left Panel - Input and Configuration */}
          <div className="space-y-6">
            {/* Input Section */}
            <Card className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Design Input
                </CardTitle>
                <CardDescription>
                  Paste your Figma file URL and access token to get started
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
                      dispatch({
                        type: "SET_FIGMA_URL",
                        payload: e.target.value,
                      })
                    }
                    className={cn(
                      "transition-colors",
                      state.figmaUrl &&
                        !isValidFigmaUrl(state.figmaUrl) &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  {state.figmaUrl && !isValidFigmaUrl(state.figmaUrl) && (
                    <p className="text-sm text-red-600">
                      Please enter a valid Figma file URL
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access-token">
                    Figma Personal Access Token
                  </Label>
                  <div className="relative">
                    <Input
                      id="access-token"
                      type={tokenVisible ? "text" : "password"}
                      placeholder="figd_..."
                      value={state.accessToken}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_ACCESS_TOKEN",
                          payload: e.target.value,
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 px-2"
                      onClick={() => setTokenVisible(!tokenVisible)}
                    >
                      {tokenVisible ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generate a token in your Figma account settings.
                    <a
                      href="https://www.figma.com/developers/api#access-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-1"
                    >
                      Learn how →
                    </a>
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isConverting && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {status}
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleConvert}
                  disabled={!canConvert}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  size="lg"
                >
                  {isConverting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {isConverting ? "Converting..." : "Convert Design"}
                </Button>

                {state.conversionResult && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Successfully generated{" "}
                      {state.conversionResult.components.length} component(s)!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Configuration Panel */}
            <ConfigPanel className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-0 shadow-xl" />

            {/* Features Info */}
            <Card className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">What You Get</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Clean, typed React components</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Tailwind CSS styling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Responsive design support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Accessibility attributes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Design token extraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Optional tests & Storybook</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Code Output */}
          <div className="h-full">
            <CodeDisplay className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-0 shadow-xl h-full min-h-[600px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
