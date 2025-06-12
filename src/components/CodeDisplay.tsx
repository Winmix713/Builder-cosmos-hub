import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Download, FileText, Palette } from "lucide-react";
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
import { GeneratedComponent, DesignTokens } from "@/types/figma";

interface CodeDisplayProps {
  components: GeneratedComponent[];
  designTokens: DesignTokens;
  selectedComponent?: GeneratedComponent;
  onComponentSelect?: (component: GeneratedComponent) => void;
  className?: string;
  theme?: "light" | "dark";
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  components,
  designTokens,
  selectedComponent,
  onComponentSelect,
  className,
  theme = "dark",
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("component");

  const component = selectedComponent || components[0];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error("Másolás sikertelen:", error);
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
    components.forEach((comp) => {
      setTimeout(() => downloadCode(comp), 100 * components.indexOf(comp));
    });
  };

  const generateDesignTokensCSS = () => {
    let css = ":root {\n";

    // Colors
    Object.entries(designTokens.colors).forEach(([name, value]) => {
      css += `  --color-${name}: ${value};\n`;
    });

    // Typography
    Object.entries(designTokens.typography).forEach(([name, token]) => {
      css += `  --font-${name}-size: ${token.fontSize};\n`;
      css += `  --font-${name}-weight: ${token.fontWeight};\n`;
      css += `  --font-${name}-line-height: ${token.lineHeight};\n`;
    });

    // Spacing
    Object.entries(designTokens.spacing).forEach(([name, value]) => {
      css += `  --spacing-${name}: ${value};\n`;
    });

    css += "}";
    return css;
  };

  if (!component) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generált Kód
          </CardTitle>
          <CardDescription>
            A konverzió után itt jelenik meg a generált React kód
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center space-y-2">
            <FileText className="w-12 h-12 mx-auto opacity-50" />
            <p>Még nincs generált kód</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>Generált Kód</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {components.length > 1 && (
              <Select
                value={component.name}
                onValueChange={(value) => {
                  const selected = components.find((c) => c.name === value);
                  if (selected && onComponentSelect) {
                    onComponentSelect(selected);
                  }
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Komponens választása" />
                </SelectTrigger>
                <SelectContent>
                  {components.map((comp) => (
                    <SelectItem key={comp.name} value={comp.name}>
                      {comp.name}
                      {comp.isMainComponent && " (fő)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCode(component)}
            >
              <Download className="w-4 h-4 mr-2" />
              Letöltés
            </Button>

            {components.length > 1 && (
              <Button variant="outline" size="sm" onClick={downloadAll}>
                <Download className="w-4 h-4 mr-2" />
                Mind
              </Button>
            )}
          </div>
        </div>

        <CardDescription>
          {component.name} - {component.props.length} props
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="component">Komponens</TabsTrigger>
            <TabsTrigger value="styles">Stílusok</TabsTrigger>
            <TabsTrigger value="tokens">Tokenek</TabsTrigger>
          </TabsList>

          <TabsContent value="component" className="flex-1 overflow-hidden">
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10"
                onClick={() => copyToClipboard(component.code, "component")}
              >
                {copiedItem === "component" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>

              <div className="h-full overflow-auto rounded-lg border">
                <SyntaxHighlighter
                  language="tsx"
                  style={theme === "dark" ? oneDark : oneLight}
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
                  {component.code}
                </SyntaxHighlighter>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="styles" className="flex-1 overflow-hidden">
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10"
                onClick={() => copyToClipboard(component.styles, "styles")}
              >
                {copiedItem === "styles" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>

              <div className="h-full overflow-auto rounded-lg border">
                <SyntaxHighlighter
                  language="javascript"
                  style={theme === "dark" ? oneDark : oneLight}
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
                  {component.styles}
                </SyntaxHighlighter>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="flex-1 overflow-hidden">
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10"
                onClick={() =>
                  copyToClipboard(generateDesignTokensCSS(), "tokens")
                }
              >
                {copiedItem === "tokens" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>

              <div className="h-full overflow-auto rounded-lg border">
                <SyntaxHighlighter
                  language="css"
                  style={theme === "dark" ? oneDark : oneLight}
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
                  {generateDesignTokensCSS()}
                </SyntaxHighlighter>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
