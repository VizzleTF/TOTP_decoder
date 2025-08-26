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
    <Card variant="success" className="mb-6 hover:shadow-large transition-all duration-300 scale-in" hover>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-success-500 to-success-600 p-3 rounded-xl shadow-soft">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {account.issuer || 'Service'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium">{account.account}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <ProgressRing
            timeLeft={timeLeft}
            period={account.period || 30}
            size={48}
          />
        </div>
      </div>

      {/* TOTP Code Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
          <Key className="w-4 h-4 mr-2" />
          Current TOTP Code
        </label>
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <code className="block w-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-200 dark:border-slate-600 px-6 py-4 rounded-xl text-3xl font-bold text-center tracking-[0.3em] text-slate-800 dark:text-slate-200 shadow-soft">
              {account.currentCode}
            </code>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse opacity-50 rounded-xl"></div>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onCopy(account.currentCode, codeId)}
            className="px-4 py-4"
          >
            {copiedId === codeId ? (
              <Check className="w-5 h-5 text-success-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* OTP Auth URL */}
      {account.otpauthUrl && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            OTP Auth URL
          </label>
          <div className="flex items-center space-x-3">
            <code className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-3 rounded-xl text-xs break-all text-slate-600 dark:text-slate-400 font-mono">
              {account.otpauthUrl || ''}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(account.otpauthUrl || '', urlId)}
              className="px-3 py-3"
            >
              {copiedId === urlId ? (
                <Check className="w-4 h-4 text-success-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}