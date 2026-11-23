import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-electric text-white",
        secondary:
          "border-transparent bg-slate-100 text-slate-700",
        destructive:
          "border-transparent bg-danger text-white",
        outline: "text-slate-700 border-slate-200",
        success: "border-transparent bg-success-light text-success-dark",
        warning: "border-transparent bg-warning-light text-warning-dark",
        purple: "border-transparent bg-electric-50 text-electric",
        forest: "border-transparent bg-emerald-frost text-forest",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
