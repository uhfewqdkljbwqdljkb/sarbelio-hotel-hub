import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className }) => {
  if (!message) return null;
  
  return (
    <p className={cn("text-sm font-medium text-destructive flex items-center gap-1", className)}>
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      {message}
    </p>
  );
};

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({ errors, className }) => {
  const errorList = Object.entries(errors).filter(([_, msg]) => msg);
  
  if (errorList.length === 0) return null;
  
  return (
    <div className={cn(
      "rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-1",
      className
    )}>
      <div className="flex items-center gap-2 text-destructive font-medium text-sm">
        <AlertCircle className="h-4 w-4" />
        Please fix the following errors:
      </div>
      <ul className="list-disc list-inside text-sm text-destructive/90 space-y-0.5 ml-1">
        {errorList.map(([field, msg]) => (
          <li key={field}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export function getInputErrorClass(hasError: boolean): string {
  return hasError ? "border-destructive focus-visible:ring-destructive" : "";
}
