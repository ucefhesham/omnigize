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
      primary: "bg-primary text-slate-900 hover:bg-primary-hover focus-visible:ring-primary shadow-sm hover:shadow-md",
      secondary: "bg-surface text-foreground-main hover:bg-background-main focus-visible:ring-border-main",
      outline: "border border-border-main bg-transparent hover:bg-background-main text-foreground-main focus-visible:ring-border-main",
      ghost: "hover:bg-background-main text-foreground-main/80 hover:text-foreground-main focus-visible:ring-border-main",
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
