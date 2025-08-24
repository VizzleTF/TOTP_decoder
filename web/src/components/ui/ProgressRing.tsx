import React from 'react'

interface ProgressRingProps {
  timeLeft: number
  period: number
  size?: number
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ 
  timeLeft, 
  period, 
  size = 40 
}) => {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (timeLeft / period) * circumference
  const percentage = (timeLeft / period) * 100

  // Color based on time remaining
  const getColor = () => {
    if (percentage > 50) return 'text-success-500'
    if (percentage > 25) return 'text-warning-500'
    return 'text-error-500'
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90 drop-shadow-sm"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-slate-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={clsx(
            'transition-all duration-1000 ease-linear drop-shadow-sm',
            getColor()
          )}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={clsx(
          'text-xs font-semibold tabular-nums',
          getColor()
        )}>
          {timeLeft}
        </span>
      </div>
    </div>
  )
}