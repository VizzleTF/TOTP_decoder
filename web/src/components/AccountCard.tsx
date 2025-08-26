import React from 'react'
import { Shield, Copy, Check, Key } from 'lucide-react'
import { TOTPAccount } from '../types/core'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { ProgressRing } from './ui/ProgressRing'

interface AccountCardProps {
  account: TOTPAccount
  timeLeft: number
  copiedId: string | null
  onCopy: (text: string, id: string) => void
  index: number
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  timeLeft,
  copiedId,
  onCopy,
  index
}) => {
  const codeId = `code-${index}`
  const urlId = `url-${index}`

  return (
    <Card variant="success" className="mb-8 hover:shadow-2xl transition-all duration-300 scale-in" hover>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start space-x-5">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-soft">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
              {account.issuer || 'Service'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">{account.account}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <ProgressRing
            timeLeft={timeLeft}
            period={account.period || 30}
            size={56}
          />
        </div>
      </div>

      {/* TOTP Code Section */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
          <Key className="w-5 h-5 mr-3" />
          Current TOTP Code
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <code className="block w-full glass-card-strong px-8 py-6 rounded-2xl text-4xl font-bold text-center tracking-[0.4em] text-slate-800 dark:text-slate-100 shadow-soft">
              {account.currentCode || '000000'}
            </code>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-50 rounded-2xl"></div>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onCopy(account.currentCode || '000000', codeId)}
            className="px-5 py-6"
          >
            {copiedId === codeId ? (
              <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* OTP Auth URL */}
      {account.otpauthUrl && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            OTP Auth URL
          </label>
          <div className="flex items-center space-x-4">
            <code className="flex-1 glass-card px-5 py-4 rounded-xl text-xs break-all text-slate-600 dark:text-slate-300 font-mono">
              {account.otpauthUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(account.otpauthUrl || '', urlId)}
              className="px-4 py-4"
            >
              {copiedId === urlId ? (
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}