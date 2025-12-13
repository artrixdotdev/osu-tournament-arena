"use client";

import { useRouter, useSearchParams } from "next/navigation";

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

export const Stepper: React.FC<{ children: React.ReactNode[] }> = ({
   children,
}) => {
   const stepper = useStepper(children.length);
   return (
      <div className="flex flex-col gap-4">
         <div>{children[stepper.currentStep]}</div>
         <div className="flex justify-center gap-2 p-4">
            {children.map((_, index) => (
               <div
                  className="bg-accent h-2 w-full cursor-pointer rounded"
                  key={index}
                  onClick={() => stepper.setStep(index)}
               />
            ))}
         </div>
      </div>
   );
};
