import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Icon goes first as a direct child; title and description fill the second column. */
export function Alert({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="alert"
      className={cn(
        'grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 rounded-xl border border-line bg-surface-1 p-5 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:text-danger',
        className,
      )}
      {...props}
    />
  )
}

export function AlertTitle({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p className={cn('col-start-2 font-medium text-ink', className)} {...props} />
  )
}

export function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('col-start-2 leading-relaxed text-ink-muted', className)}
      {...props}
    />
  )
}
