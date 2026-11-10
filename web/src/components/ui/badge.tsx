import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-xs tabular-nums transition-colors duration-150',
  {
    variants: {
      variant: {
        secondary: 'border-transparent bg-surface-2 text-ink-muted',
        outline: 'border-line text-ink-subtle',
        destructive: 'border-danger text-danger',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
)

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
