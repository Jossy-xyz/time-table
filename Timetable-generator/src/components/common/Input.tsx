import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

/**
 * Institutional Academic Input
 * Features: Disciplined geometry, high-contrast labels, and status-aware styling.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      type = "text",
      required = false,
      id,
      className = "",
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || `academic-input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = `${inputId}-error`;

    return (
      <div className="mb-6">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[10px] font-black uppercase tracking-[0.2em] text-institutional-muted mb-2"
          >
            {label}
            {required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`w-full px-4 py-3 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary placeholder:text-institutional-muted/40 focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all ${
              error ? "border-status-error focus:ring-status-error/10" : ""
            } ${className}`}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          <div
            className={`absolute bottom-0 left-0 h-[2px] w-0 bg-brick transition-all duration-500 group-focus-within:w-full ${error ? "bg-status-error w-full" : ""}`}
          />
        </div>
        {error && (
          <p
            id={errorId}
            className="flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest text-status-error animate-fadeIn"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-status-error" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
