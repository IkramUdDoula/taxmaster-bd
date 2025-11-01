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
    <div className={cn("flex items-center justify-center space-x-2 sm:space-x-4 mb-8", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold smooth-transition shadow-lg",
                  {
                    "bg-primary text-white shadow-glow scale-110": isCurrent,
                    "bg-green-500 text-white": isCompleted,
                    "bg-muted text-muted-foreground": !isCurrent && !isCompleted,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "mt-3 text-xs sm:text-sm font-semibold smooth-transition tracking-tight",
                  {
                    "text-primary": isCurrent,
                    "text-green-500": isCompleted,
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
                  "w-12 sm:w-16 h-1 mx-2 sm:mx-4 rounded-full smooth-transition",
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
