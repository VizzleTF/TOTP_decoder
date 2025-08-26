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
          'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-soft hover:shadow-medium focus:ring-blue-500 active:scale-95': variant === 'primary',
          'glass-card-strong text-slate-700 dark:text-slate-200 hover:shadow-medium focus:ring-slate-500 active:scale-95': variant === 'secondary',
          'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 focus:ring-slate-500 active:scale-95': variant === 'ghost',
          'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-soft hover:shadow-medium focus:ring-emerald-500 active:scale-95': variant === 'success',
          'border-2 border-slate-200/80 dark:border-slate-600/50 text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 focus:ring-blue-500 active:scale-95 backdrop-blur-sm': variant === 'outline'
        },
        {
          'px-3 py-2 text-sm rounded-xl': size === 'sm',
          'px-5 py-3 text-sm rounded-xl': size === 'md',
          'px-7 py-4 text-base rounded-2xl': size === 'lg'
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