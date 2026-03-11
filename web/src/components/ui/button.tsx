import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "defaults" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "defaults", isLoading, children, ...props }, ref) => {
    
    // Base styles
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    
    // Variants
    const variants = {
      primary: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900 shadow-sm hover:shadow-md",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-200",
      outline: "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900 focus-visible:ring-slate-200",
      ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus-visible:ring-slate-200",
    };

    // Sizes
    const sizes = {
      defaults: "h-11 px-5 py-2",
      sm: "h-9 rounded-lg px-3",
      lg: "h-12 rounded-xl px-8 text-base",
      icon: "h-11 w-11",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-spin text-[18px] me-2">
            progress_activity
          </span>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
