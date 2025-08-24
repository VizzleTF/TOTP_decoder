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
          'bg-white shadow-soft border border-slate-200/60': variant === 'default',
          'bg-gradient-to-br from-success-50 to-success-100/50 border border-success-200/60 shadow-soft': variant === 'success',
          'bg-gradient-to-br from-error-50 to-error-100/50 border border-error-200/60 shadow-soft': variant === 'error',
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