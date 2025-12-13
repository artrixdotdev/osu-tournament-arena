"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@ota/ui";

export const useStepper = (stepCount: number) => {
   const router = useRouter();
   const searchParams = useSearchParams();

   const currentStep = Number(searchParams.get("step")) || 0;
   const setStep = (step: number) => {
      router.push(`?step=${step}`);
   };
   const bumpStep = () => {
      if (currentStep < stepCount) {
         setStep(currentStep + 1);
      }
   };

   const resetStep = () => {
      setStep(0);
   };

   return { currentStep, setStep, bumpStep, resetStep };
};

export interface StepperProps {
   children: React.ReactNode[];
   className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ children, className }) => {
   const stepper = useStepper(children.length);
   return (
      <div className={cn("flex flex-col gap-4", className)}>
         {children[stepper.currentStep]}
         <div className="flex justify-center gap-2 p-4">
            {children.map((_, index) => (
               <div
                  className={cn(
                     `bg-secondary h-2 w-full cursor-pointer rounded transition-colors duration-300`,
                     index === stepper.currentStep ? "bg-accent" : "",
                  )}
                  key={index}
                  onClick={() => stepper.setStep(index)}
               />
            ))}
         </div>
      </div>
   );
};
