"use client";

import { useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@ota/ui";

export const useStepper = (stepCount: number) => {
   const router = useRouter();
   const searchParams = useSearchParams();

   const currentStep = Number(searchParams.get("step")) || 0;

   const setStep = useCallback(
      (step: number) => {
         router.push(`?step=${step}`);
      },
      [router],
   );

   const bumpStep = useCallback(() => {
      if (currentStep < stepCount - 1) {
         setStep(currentStep + 1);
      }
   }, [currentStep, stepCount, setStep]);

   const prevStep = useCallback(() => {
      if (currentStep > 0) {
         setStep(currentStep - 1);
      }
   }, [currentStep, setStep]);

   const resetStep = useCallback(() => {
      setStep(0);
   }, [setStep]);

   return { currentStep, setStep, bumpStep, prevStep, resetStep, stepCount };
};

export interface StepperProps {
   children: React.ReactNode[];
   className?: string;
   containerClassName?: string;
   ariaLabel?: string;
}

export const Stepper: React.FC<StepperProps> = ({
   children,
   className,
   containerClassName,
   ariaLabel = "Multi-step form",
}) => {
   const stepper = useStepper(children.length);
   const containerRef = useRef<HTMLDivElement>(null);

   const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
         case "ArrowRight":
         case "ArrowDown":
            e.preventDefault();
            stepper.bumpStep();
            break;
         case "ArrowLeft":
         case "ArrowUp":
            e.preventDefault();
            stepper.prevStep();
            break;
         case "Home":
            e.preventDefault();
            stepper.setStep(0);
            break;
         case "End":
            e.preventDefault();
            stepper.setStep(children.length - 1);
            break;
      }
   };

   return (
      <div
         ref={containerRef}
         className={cn("flex flex-col gap-4 outline-none", containerClassName)}
         role="region"
         aria-label={ariaLabel}
         tabIndex={0}
         onKeyDown={handleKeyDown}
      >
         {/* Step content */}
         <div
            role="tabpanel"
            className={className}
            aria-label={`Step ${stepper.currentStep + 1} of ${children.length}`}
         >
            {children[stepper.currentStep]}
         </div>

         {/* Step indicators */}
         <div
            role="tablist"
            aria-label="Step navigation"
            className="flex justify-center gap-2 p-4"
         >
            {children.map((_, index) => (
               <button
                  key={index}
                  role="tab"
                  type="button"
                  aria-selected={index === stepper.currentStep}
                  aria-label={`Go to step ${index + 1} of ${children.length}`}
                  tabIndex={-1}
                  className={cn(
                     "h-2 w-full cursor-pointer rounded transition-colors duration-300",
                     "focus:ring-accent focus:ring-2 focus:ring-offset-2 focus:outline-none",
                     index === stepper.currentStep ? "bg-accent" : "bg-muted",
                  )}
                  onClick={() => stepper.setStep(index)}
               />
            ))}
         </div>

         {/* Screen reader announcement */}
         <div className="sr-only" aria-live="polite" aria-atomic="true">
            Step {stepper.currentStep + 1} of {children.length}
         </div>
      </div>
   );
};
