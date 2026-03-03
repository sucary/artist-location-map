import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface FormGroupProps {
    children: ReactNode;
    className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
    return <div className={cn('space-y-1', className)}>{children}</div>;
}
