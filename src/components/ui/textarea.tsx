import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "flex field-sizing-content min-h-16 w-full rounded-xl border border-input bg-surface-2 px-3 py-2 text-base shadow-inner shadow-foreground/5 transition-all outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-surface-1 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/20 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
                className
            )}
            {...props}
        />
    )
}

export { Textarea }
