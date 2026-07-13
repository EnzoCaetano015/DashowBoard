import type { SVGProps } from "react"

import { Enum } from "@/backend/api/enums/enum"
import type { ProviderIconProps } from "@/components/ProviderIcon/ProviderIcon.types"
import { cn } from "@/lib/utils"

const GitHub = (props: SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53v-1.85c-3.06.67-3.71-1.48-3.71-1.48-.5-1.28-1.23-1.62-1.23-1.62-1-.68.08-.67.08-.67 1.11.08 1.7 1.14 1.7 1.14.99 1.69 2.6 1.2 3.23.92.1-.72.39-1.2.7-1.48-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.19 1.14-2.96-.12-.28-.5-1.4.11-2.92 0 0 .93-.3 3.05 1.13.88-.24 1.83-.36 2.77-.36.94 0 1.9.12 2.78.36 2.12-1.43 3.05-1.13 3.05-1.13.61 1.52.23 2.64.11 2.92.71.77 1.76 1.14 2.96 0 4.24-2.58 5.15-5.03 5.42.4.34.76 1.02.76 2.06v3.05c0 .3.2.64.75.53 4.37-1.46 7.51-5.58 7.51-10.43C23.02 5.24 18.27.5 12 .5z" />
    </svg>
)

const Vercel = (props: SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M12 2 22 20H2L12 2z" />
    </svg>
)

const Railway = (props: SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        {...props}
    >
        <rect
            x="3"
            y="4"
            width="18"
            height="12"
            rx="2"
        />
        <path
            d="M7 20l2-2M17 20l-2-2"
            strokeLinecap="round"
        />
        <circle
            cx="8"
            cy="14"
            r="1"
            fill="currentColor"
        />
        <circle
            cx="16"
            cy="14"
            r="1"
            fill="currentColor"
        />
    </svg>
)

const Supabase = (props: SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M13.5 2.2c.9-1.1 2.7-.5 2.7 1v7.2h5.6c1.3 0 2 1.5 1.2 2.5L10.5 21.8c-.9 1.1-2.7.5-2.7-1v-7.2H2.2c-1.3 0-2-1.5-1.2-2.5L13.5 2.2z" />
    </svg>
)

const cores: Record<Enum.Provider, string> = {
    [Enum.Provider.GitHub]: "text-foreground",
    [Enum.Provider.Vercel]: "text-foreground",
    [Enum.Provider.Railway]: "text-provider-railway",
    [Enum.Provider.Supabase]: "text-success",
}

export const ProviderIcon = ({ provider, className, decorativo = true }: ProviderIconProps) => {
    const props = {
        className: cn("size-4", cores[provider], className),
        "aria-hidden": decorativo || undefined,
        "aria-label": decorativo ? undefined : provider,
    }

    if (provider === Enum.Provider.GitHub) return <GitHub {...props} />
    if (provider === Enum.Provider.Vercel) return <Vercel {...props} />
    if (provider === Enum.Provider.Railway) return <Railway {...props} />
    return <Supabase {...props} />
}
