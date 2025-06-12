import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Loader2 } from "lucide-react";

interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface ProgressIndicatorProps {
  progress: number;
  status: string;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  status,
  className,
}) => {
  const steps: ProgressStep[] = [
    {
      id: "fetch",
      label: "Figma adatok lekérése",
      completed: progress > 20,
      current: progress > 0 && progress <= 20,
    },
    {
      id: "analyze",
      label: "Design elemzése",
      completed: progress > 50,
      current: progress > 20 && progress <= 50,
    },
    {
      id: "convert",
      label: "Komponensek generálása",
      completed: progress > 80,
      current: progress > 50 && progress <= 80,
    },
    {
      id: "optimize",
      label: "Kód optimalizálása",
      completed: progress === 100,
      current: progress > 80 && progress < 100,
    },
  ];

  return (
    <Card className={`${className} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[#131316]/75 rounded-lg mix-blend-soft-light pointer-events-none"></div>
      <CardContent className="pt-6 relative z-10">
        <div className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-white/90">
                Konverzió előrehaladása
              </span>
              <span className="text-[#616266]">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-2 text-sm text-[#616266]">
            <Loader2 className="w-4 h-4 animate-spin" />
            {status}
          </div>

          {/* Step by Step Progress */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium text-white/90">Lépések</h4>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : step.current ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      step.completed
                        ? "text-green-400 font-medium"
                        : step.current
                          ? "text-white/90 font-medium"
                          : "text-[#616266]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Time */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-[#616266]">
              <span>Becsült idő:</span>
              <span>
                {progress < 50
                  ? "~30 másodperc"
                  : progress < 80
                    ? "~15 másodperc"
                    : "~5 másodperc"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
