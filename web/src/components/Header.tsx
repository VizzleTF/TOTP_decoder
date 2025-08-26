import React from 'react'
import { QrCode, Sparkles } from 'lucide-react'

export const Header: React.FC = () => (
  <div className="text-center mb-16 fade-in">
    <div className="flex items-center justify-center mb-6 floating-animation">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl blur-lg opacity-30"></div>
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 p-4 rounded-2xl shadow-large">
          <QrCode className="w-8 h-8 text-white" />
        </div>
      </div>
      <Sparkles className="w-5 h-5 text-primary-500 ml-3 animate-pulse" />
    </div>
    
    <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text leading-tight">
      TOTP QR Decoder
    </h1>
    
    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
      Decode your authenticator QR codes with{' '}
      <span className="font-medium text-primary-600">military-grade security</span>{' '}
      and{' '}
      <span className="font-medium text-primary-600">zero data transmission</span>
    </p>
    
    <div className="flex items-center justify-center mt-6 space-x-6 text-sm text-slate-500 dark:text-slate-400">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
        100% Client-Side
      </div>
      <div className="flex items-center">
        <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
        No Data Sent
      </div>
    </div>
  </div>
)