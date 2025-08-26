import React from 'react'
import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'error' | 'glass'
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false
}) => {
  return (
    <div
      className={clsx(
        'rounded-3xl transition-all duration-300',
        {
          'glass-card-strong': variant === 'default',
          'bg-gradient-to-br from-emerald-50/90 to-green-50/90 dark:from-slate-800/90 dark:to-slate-700/90 border border-emerald-200/60 dark:border-slate-600/60 shadow-soft backdrop-blur-xl': variant === 'success', 'bg-gradient-to-br from-red-50/90 to-rose-50/90 dark:from-red-900/30 dark:to-rose-900/30 border border-red-200/60 dark:border-red-700/60 shadow-soft backdrop-blur-xl': variant === 'error',
          'glass-card': variant === 'glass'
        },
        {
          'hover:shadow-large hover:-translate-y-1 cursor-pointer': hover
        },
        'p-8',
        className
      )}
    >
      {children}
    </div>
  )
}