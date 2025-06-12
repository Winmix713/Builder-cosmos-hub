import React from "react";
import { Settings, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface ConfigPanelProps {
  className?: string;
}

export function ConfigPanel({ className }: ConfigPanelProps) {
  const { state, dispatch } = useAppContext();
  const [isOpen, setIsOpen] = React.useState(false);

  const updateOption = (key: string, value: any) => {
    dispatch({
      type: "SET_CONVERSION_OPTIONS",
      payload: { [key]: value },
    });
  };

  return (
    <Card className={cn("w-full", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <CardTitle className="text-lg">Conversion Settings</CardTitle>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            <CardDescription>
              Customize how your Figma designs are converted to React code
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Naming Conventions */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Naming Conventions
              </h4>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="component-naming">Component Naming</Label>
                  <Select
                    value={state.conversionOptions.componentNamingConvention}
                    onValueChange={(value) =>
                      updateOption("componentNamingConvention", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select naming convention" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PascalCase">
                        PascalCase (recommended)
                      </SelectItem>
                      <SelectItem value="camelCase">camelCase</SelectItem>
                      <SelectItem value="kebab-case">kebab-case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prop-naming">Property Naming</Label>
                  <Select
                    value={state.conversionOptions.propNamingConvention}
                    onValueChange={(value) =>
                      updateOption("propNamingConvention", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select naming convention" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camelCase">
                        camelCase (recommended)
                      </SelectItem>
                      <SelectItem value="snake_case">snake_case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Code Generation Options */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Code Generation
              </h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Generate Unit Tests</Label>
                    <p className="text-sm text-muted-foreground">
                      Create React Testing Library tests for components
                    </p>
                  </div>
                  <Switch
                    checked={state.conversionOptions.generateTests}
                    onCheckedChange={(checked) =>
                      updateOption("generateTests", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Generate Storybook Stories</Label>
                    <p className="text-sm text-muted-foreground">
                      Create Storybook stories for component documentation
                    </p>
                  </div>
                  <Switch
                    checked={state.conversionOptions.generateStorybook}
                    onCheckedChange={(checked) =>
                      updateOption("generateStorybook", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Extract Design Tokens</Label>
                    <p className="text-sm text-muted-foreground">
                      Generate design system tokens from Figma styles
                    </p>
                  </div>
                  <Switch
                    checked={state.conversionOptions.extractDesignTokens}
                    onCheckedChange={(checked) =>
                      updateOption("extractDesignTokens", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Accessibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Add ARIA attributes and semantic HTML
                    </p>
                  </div>
                  <Switch
                    checked={state.conversionOptions.includeAccessibility}
                    onCheckedChange={(checked) =>
                      updateOption("includeAccessibility", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Optimize Assets</Label>
                    <p className="text-sm text-muted-foreground">
                      Compress and optimize images and SVGs
                    </p>
                  </div>
                  <Switch
                    checked={state.conversionOptions.optimizeAssets}
                    onCheckedChange={(checked) =>
                      updateOption("optimizeAssets", checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Framework Options */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Framework
              </h4>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="css-framework">CSS Framework</Label>
                  <Select
                    value={state.conversionOptions.cssFramework}
                    onValueChange={(value) =>
                      updateOption("cssFramework", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CSS framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tailwind">
                        Tailwind CSS (recommended)
                      </SelectItem>
                      <SelectItem value="styled-components">
                        Styled Components
                      </SelectItem>
                      <SelectItem value="css-modules">CSS Modules</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output-format">Output Format</Label>
                  <Select
                    value={state.conversionOptions.outputFormat}
                    onValueChange={(value) =>
                      updateOption("outputFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select output format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="components">
                        Individual Components
                      </SelectItem>
                      <SelectItem value="full-project">
                        Full Project Structure
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
