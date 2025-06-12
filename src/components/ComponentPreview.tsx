import React from "react";
import { GeneratedComponent } from "@/types/figma";

interface ComponentPreviewProps {
  component?: GeneratedComponent;
  className?: string;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component,
  className,
}) => {
  if (!component) {
    return (
      <div
        className={`h-96 flex items-center justify-center bg-muted/50 rounded-lg ${className || ""}`}
      >
        <div className="text-center space-y-2 text-muted-foreground">
          <div className="w-12 h-12 mx-auto opacity-50 border-2 border-dashed border-current rounded-lg flex items-center justify-center">
            <span className="text-lg">📱</span>
          </div>
          <p>Válasszon egy komponenst az előnézethez</p>
          <p className="text-sm">
            A komponens itt jelenik meg amint elkészül a konverzió
          </p>
        </div>
      </div>
    );
  }

  // Itt lenne a tényleges komponens renderelése
  // Biztonsági okokból most csak egy placeholder-t mutatunk
  return (
    <div className={`h-96 border rounded-lg p-4 bg-white ${className || ""}`}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            Előnézet: {component.name}
          </h4>
          <div className="text-xs text-muted-foreground">
            {component.props.length} props
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-200">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
              {component.name.charAt(0)}
            </div>
            <p className="font-medium">{component.name}</p>
            <p className="text-sm text-muted-foreground">
              Élő előnézet hamarosan
            </p>
          </div>
        </div>

        {component.props.length > 0 && (
          <div className="mt-4 space-y-2">
            <h5 className="text-sm font-medium">Props:</h5>
            <div className="flex flex-wrap gap-1">
              {component.props.slice(0, 3).map((prop, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                >
                  {prop.name}
                </span>
              ))}
              {component.props.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                  +{component.props.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
