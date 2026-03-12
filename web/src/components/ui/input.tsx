import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {icon && (
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              {icon}
            </span>
          </div>
        )}
        <input
          type={type}
          className={`
            flex h-12 w-full rounded-xl border bg-background-main/50 px-3 py-2 text-sm text-foreground-main 
            transition-all duration-200 outline-none
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-slate-400 
            hover:bg-background-main hover:border-border-main/80
            focus-visible:bg-background-main focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${icon ? "ps-11" : ""}
            ${error ? "border-red-500 hover:border-red-500 focus-visible:ring-red-500" : "border-border-main"}
            ${className || ""}
          `}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="absolute -bottom-5 start-0 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
