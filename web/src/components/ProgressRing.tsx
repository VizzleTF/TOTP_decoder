import React from 'react'
import { ProgressRingProps } from '../types'

export const ProgressRing: React.FC<ProgressRingProps> = ({ 
  timeLeft, 
  period = 30, 
  size = 24 
}) => {
  const radius = (size - 4) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (timeLeft / period) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          className="text-gray-600"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="text-green-400 transition-all duration-1000 ease-linear"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-mono text-gray-300">
          {timeLeft}
        </span>
      </div>
    </div>
  )
}