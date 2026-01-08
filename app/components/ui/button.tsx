import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-none text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer relative overflow-hidden",
                    {
                        // Defaut: Red Background, White Text
                        'bg-primary text-white hover:bg-primary/90 border border-transparent': variant === 'default',

                        // Outline: Transparent bg, white border, hover fills white
                        'border border-white/20 bg-transparent text-foreground hover:bg-white/10': variant === 'outline',

                        // Ghost: Transparent, hover bg
                        'hover:bg-white/10 hover:text-white': variant === 'ghost',

                        // Destructive (same as primary basically in this theme, but maybe darker red?)
                        'bg-red-900 text-red-100 hover:bg-red-800': variant === 'destructive',

                        'h-10 px-6 py-2': size === 'default',
                        'h-8 px-4 text-xs': size === 'sm',
                        'h-12 px-8': size === 'lg',
                        'h-10 w-10': size === 'icon',
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
