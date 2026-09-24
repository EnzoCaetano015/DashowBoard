import type { IconActionProps } from "@/components/IconAction/IconAction.types"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const IconAction = ({ label, children, ...buttonProps }: IconActionProps) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <Button
                    {...buttonProps}
                    aria-label={label}
                />
            }
        >
            {children}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
)
