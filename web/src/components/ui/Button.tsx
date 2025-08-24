import React from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        'ripple relative overflow-hidden',
        {
          // Primary variant
          'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-soft hover:shadow-medium hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 active:scale-95': variant === 'primary',
          
          // Secondary variant
          'bg-white text-slate-700 shadow-soft border border-slate-200 hover:bg-slate-50 hover:shadow-medium focus:ring-slate-500 active:scale-95': variant === 'secondary',
          
          // Ghost variant
          'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-500 active:scale-95': variant === 'ghost',
          
          // Success variant
          'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-soft hover:shadow-medium hover:from-success-600 hover:to-success-700 focus:ring-success-500 active:scale-95': variant === 'success',
          
          // Outline variant
          'border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 focus:ring-primary-500 active:scale-95': variant === 'outline'
        },
        {
          'px-3 py-1.5 text-sm rounded-lg': size === 'sm',
          'px-4 py-2.5 text-sm rounded-xl': size === 'md',
          'px-6 py-3.5 text-base rounded-xl': size === 'lg'
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}