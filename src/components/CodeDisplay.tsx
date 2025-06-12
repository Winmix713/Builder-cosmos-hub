import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Download, Eye, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { GeneratedComponent } from "@/types/figma";
import { cn } from "@/lib/utils";

interface CodeDisplayProps {
  className?: string;
}

export function CodeDisplay({ className }: CodeDisplayProps) {
  const { state } = useAppContext();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("code");

  const selectedComponent =
    state.conversionResult?.components.find(
      (comp) => comp.name === state.selectedComponent,
    ) || state.conversionResult?.components[0];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const downloadCode = (component: GeneratedComponent) => {
    const element = document.createElement("a");
    const file = new Blob([component.code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${component.name}.tsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAll = () => {
    if (!state.conversionResult?.components) return;

    const zip = new Map<string, string>();

    state.conversionResult.components.forEach((component) => {
      zip.set(`${component.name}.tsx`, component.code);

      if (component.tests) {
        zip.set(`${component.name}.test.tsx`, component.tests);
      }

      if (component.storybook) {
        zip.set(`${component.name}.stories.tsx`, component.storybook);
      }
    });

    // For now, just download the main component
    // In a real implementation, you'd create a proper zip file
    if (selectedComponent) {
      downloadCode(selectedComponent);
    }
  };

  if (!state.conversionResult || !selectedComponent) {
    return (
      <Card className={cn("w-full h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Generated Code
          </CardTitle>
          <CardDescription>
            Convert a Figma design to see the generated React code here
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center space-y-2">
            <Code2 className="w-12 h-12 mx-auto opacity-50" />
            <p>No code generated yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full h-full flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            <CardTitle>Generated Code</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {state.conversionResult.components.length > 1 && (
              <Select
                value={state.selectedComponent || ""}
                onValueChange={(value) =>
                  state.dispatch({
                    type: "SET_SELECTED_COMPONENT",
                    payload: value,
                  })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select component" />
                </SelectTrigger>
                <SelectContent>
                  {state.conversionResult.components.map((component) => (
                    <SelectItem key={component.name} value={component.name}>
                      {component.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCode(selectedComponent)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <Button variant="outline" size="sm" onClick={downloadAll}>
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>

        <CardDescription>
          {selectedComponent.name} - {selectedComponent.props.length} props,{" "}
          {selectedComponent.dependencies.length} dependencies
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="code">Component</TabsTrigger>
            <TabsTrigger value="preview" disabled>
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="tests"
              disabled={!selectedComponent.tests}
              className={!selectedComponent.tests ? "opacity-50" : ""}
            >
              Tests
            </TabsTrigger>
            <TabsTrigger
              value="storybook"
              disabled={!selectedComponent.storybook}
              className={!selectedComponent.storybook ? "opacity-50" : ""}
            >
              Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="flex-1 overflow-hidden">
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10"
                onClick={() =>
                  copyToClipboard(selectedComponent.code, "component")
                }
              >
                {copiedCode === "component" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>

              <div className="h-full overflow-auto rounded-lg border">
                <SyntaxHighlighter
                  language="tsx"
                  style={state.theme === "dark" ? oneDark : oneLight}
                  className="h-full"
                  showLineNumbers
                  wrapLines
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                >
                  {selectedComponent.code}
                </SyntaxHighlighter>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1">
            <div className="h-full flex items-center justify-center border rounded-lg bg-muted/50">
              <div className="text-center space-y-2 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto opacity-50" />
                <p>Live preview coming soon</p>
                <p className="text-sm">
                  Component preview will be available in a future update
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tests" className="flex-1 overflow-hidden">
            {selectedComponent.tests ? (
              <div className="relative h-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10"
                  onClick={() =>
                    copyToClipboard(selectedComponent.tests!, "tests")
                  }
                >
                  {copiedCode === "tests" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>

                <div className="h-full overflow-auto rounded-lg border">
                  <SyntaxHighlighter
                    language="tsx"
                    style={state.theme === "dark" ? oneDark : oneLight}
                    className="h-full"
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      background: "transparent",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {selectedComponent.tests}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border rounded-lg bg-muted/50">
                <p className="text-muted-foreground">
                  No tests generated for this component
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="storybook" className="flex-1 overflow-hidden">
            {selectedComponent.storybook ? (
              <div className="relative h-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10"
                  onClick={() =>
                    copyToClipboard(selectedComponent.storybook!, "storybook")
                  }
                >
                  {copiedCode === "storybook" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>

                <div className="h-full overflow-auto rounded-lg border">
                  <SyntaxHighlighter
                    language="tsx"
                    style={state.theme === "dark" ? oneDark : oneLight}
                    className="h-full"
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      background: "transparent",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {selectedComponent.storybook}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border rounded-lg bg-muted/50">
                <p className="text-muted-foreground">
                  No Storybook stories generated for this component
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
