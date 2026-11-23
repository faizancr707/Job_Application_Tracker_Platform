import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl bg-white px-4 py-3 text-slate-900 text-base border border-slate-200 ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40 focus-visible:border-electric/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-slate-300",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
