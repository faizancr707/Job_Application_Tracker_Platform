import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl bg-white px-4 py-2 text-slate-900 text-base border border-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40 focus-visible:border-electric/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-slate-300",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
