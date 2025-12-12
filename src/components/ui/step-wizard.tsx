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
    <div className={cn("w-full overflow-x-auto mb-8 px-2", className)}>
      <div className="flex items-center justify-center min-w-max mx-auto space-x-1 sm:space-x-2 md:space-x-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center p-1">
                <div
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold smooth-transition shadow-lg",
                    {
                      "bg-primary text-white shadow-glow scale-110": isCurrent,
                      "bg-green-500 text-white": isCompleted,
                      "bg-muted text-muted-foreground": !isCurrent && !isCompleted,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-6 sm:h-6" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 sm:mt-3 text-[10px] sm:text-xs md:text-sm font-semibold smooth-transition tracking-tight whitespace-nowrap",
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
                    "w-6 sm:w-12 md:w-16 h-1 mx-1 sm:mx-2 md:mx-4 rounded-full smooth-transition flex-shrink-0",
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
    </div>
  );
}
