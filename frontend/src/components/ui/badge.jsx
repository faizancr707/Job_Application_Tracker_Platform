import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-burnt-orange focus:ring-offset-2 focus:ring-offset-warm-ivory",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-burnt-orange text-white hover:bg-burnt-orange-hover",
        secondary:
          "border-[--border-subtle] bg-warm-ivory-dark text-charcoal hover:bg-warm-ivory-muted",
        destructive:
          "border-transparent bg-terracotta text-white hover:bg-terracotta/90",
        outline: "border-[--border-subtle] text-charcoal bg-white",
        success: "border-lime-green bg-lime-green-light text-deep-green font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }