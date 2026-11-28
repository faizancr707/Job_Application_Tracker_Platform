import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-electric-soft to-electric text-white shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.35)] hover:from-electric hover:to-electric-dim active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]",
        destructive:
          "bg-gradient-to-r from-danger to-danger-dark text-white shadow-[0_4px_16px_rgba(239,68,68,0.2)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]",
        outline:
          "bg-white text-slate-700 border border-slate-200 shadow-glass-sm hover:bg-slate-50 hover:text-electric hover:border-electric/30 active:bg-slate-100",
        secondary:
          "bg-slate-100 text-slate-700 shadow-glass-sm hover:bg-slate-200 active:bg-slate-100",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-electric active:bg-slate-50",
        link: "text-electric underline-offset-4 hover:underline hover:text-electric-dim shadow-none",
        accent: "bg-gradient-to-r from-emerald-bright to-emerald text-white font-bold shadow-[0_4px_16px_rgba(45,106,79,0.2)] hover:shadow-[0_8px_24px_rgba(45,106,79,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]",
        forest: "bg-gradient-to-r from-forest to-emerald text-white font-bold shadow-[0_4px_16px_rgba(27,67,50,0.25)] hover:shadow-[0_8px_24px_rgba(27,67,50,0.35)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }

  const { disabled, whileHover, whileTap, ...rest } = props;

  return (
    <motion.button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled}
      whileHover={!disabled ? (whileHover !== undefined ? whileHover : { scale: 1.02 }) : undefined}
      whileTap={!disabled ? (whileTap !== undefined ? whileTap : { scale: 0.98 }) : undefined}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      {...rest}
    />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
