import type { ComponentProps } from "react"

import type { Button } from "@/components/ui/button"

export type IconActionProps = Omit<ComponentProps<typeof Button>, "aria-label" | "title"> & {
    label: string
}
