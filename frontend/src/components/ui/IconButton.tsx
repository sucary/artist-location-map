import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const iconButtonVariants = cva(
    'text-text-muted hover:text-primary transition-colors',
    {
        variants: {
            size: {
                sm: 'p-1',
                md: 'p-2',
                lg: 'p-3',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
);

export interface IconButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof iconButtonVariants> {
    children: ReactNode;
}

export function IconButton({
    children,
    size,
    className,
    ...props
}: IconButtonProps) {
    return (
        <button
            className={cn(iconButtonVariants({ size }), className)}
            {...props}
        >
            {children}
        </button>
    );
}
