import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React from "react";
import { Slot } from "@radix-ui/react-slot";

export const buttonVariants = cva(
  "font-head transition-all rounded outline-hidden cursor-pointer duration-200 font-medium flex items-center",
  {
    variants: {
      variant: {
        default:
          "shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none bg-primary text-primary-foreground border-2 border-black transition hover:bg-primary-hover",
        secondary:
          "shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none bg-secondary text-secondary-foreground border-2 border-black transition hover:bg-secondary-hover",
        outline:
          "shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none bg-transparent border-2 transition",
        link: "bg-transparent hover:underline",
        ghost: "bg-transparent hover:bg-accent"
      },
      size: {
        sm: "px-3 py-1 text-sm shadow hover:shadow-none",
        md: "px-4 py-1.5 text-base",
        lg: "px-6 lg:px-8 py-2 lg:py-3 text-md lg:text-lg",
        icon: "p-2",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export const Button = React.forwardRef((
  {
    children,
    size = "md",
    className = "",
    variant = "default",
    asChild = false,
    ...props
  },
  forwardedRef,
) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={forwardedRef}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}>
      {children}
    </Comp>
  );
});

Button.displayName = "Button";