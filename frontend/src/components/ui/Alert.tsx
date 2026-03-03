import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
    'p-2 border rounded text-sm',
    {
        variants: {
            variant: {
                error: 'bg-error/10 border-error/30 text-error',
                success: 'bg-green-500/10 border-green-500/30 text-green-600',
                warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600',
                info: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
            },
        },
        defaultVariants: {
            variant: 'info',
        },
    }
);

export interface AlertProps extends VariantProps<typeof alertVariants> {
    children: ReactNode;
    className?: string;
}

export function Alert({ variant, children, className }: AlertProps) {
    return (
        <div className={cn(alertVariants({ variant }), className)}>
            {children}
        </div>
    );
}
