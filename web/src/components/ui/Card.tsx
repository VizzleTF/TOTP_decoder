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
        'rounded-2xl transition-all duration-300',
        {
          'bg-white dark:bg-slate-800 shadow-soft border border-slate-200/60 dark:border-slate-700/60': variant === 'default',
          'bg-gradient-to-br from-success-50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20 border border-success-200/60 dark:border-success-700/60 shadow-soft': variant === 'success',
          'bg-gradient-to-br from-error-50 to-error-100/50 dark:from-error-900/20 dark:to-error-800/20 border border-error-200/60 dark:border-error-700/60 shadow-soft': variant === 'error',
          'glass-card': variant === 'glass'
        },
        {
          'hover:shadow-medium hover:-translate-y-1 cursor-pointer': hover
        },
        'p-6',
        className
      )}
    >
      {children}
    </div>
  )
}