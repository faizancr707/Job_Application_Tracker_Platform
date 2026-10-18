import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-warm-ivory transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burnt-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-burnt-orange text-white hover:bg-burnt-orange-hover shadow-sm hover:shadow-glow-orange",
        destructive:
          "bg-terracotta text-white hover:bg-terracotta/90 shadow-sm",
        outline:
          "border border-[--border-subtle] bg-white text-charcoal hover:bg-surface-hover hover:border-burnt-orange hover:text-burnt-orange",
        secondary:
          "bg-warm-ivory-dark text-charcoal hover:bg-warm-ivory-muted border border-[--border-subtle]",
        ghost: "text-charcoal hover:bg-surface-hover hover:text-burnt-orange",
        link: "text-[#A84300] underline-offset-4 hover:underline hover:text-[#713000]",
        accent: "bg-lime-green text-charcoal font-semibold hover:bg-lime-green-dim shadow-sm hover:shadow-glow-lime",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }