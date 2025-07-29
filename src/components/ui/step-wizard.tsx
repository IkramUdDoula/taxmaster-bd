"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepWizardProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepWizard({ steps, currentStep, className }: StepWizardProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-4 mb-8", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  {
                    "bg-primary text-primary-foreground": isCurrent,
                    "bg-green-500 text-white": isCompleted,
                    "bg-muted text-muted-foreground": !isCurrent && !isCompleted,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium transition-colors duration-300",
                  {
                    "text-primary": isCurrent,
                    "text-green-600": isCompleted,
                    "text-muted-foreground": !isCurrent && !isCompleted,
                  }
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-16 h-0.5 mx-4 transition-colors duration-300",
                  {
                    "bg-green-500": isCompleted,
                    "bg-muted": !isCompleted,
                  }
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
