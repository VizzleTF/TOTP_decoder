import React from 'react'
import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'error'
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  variant = 'default'
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl shadow-sm border p-6',
        {
          'bg-gray-800 border-gray-700': variant === 'default',
          'bg-green-900/20 border-green-600': variant === 'success',
          'bg-red-900/20 border-red-600': variant === 'error'
        },
        className
      )}
    >
      {children}
    </div>
  )
}