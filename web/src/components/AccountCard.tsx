import React from 'react'
import { Shield, Copy, CheckCircle, Clock, Key } from 'lucide-react'
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
            <h3 className="text-xl font-semibold text-slate-800 mb-1">
              {account.issuer || 'Service'}
            </h3>
            <p className="text-slate-600 font-medium">{account.account}</p>
            <div className="flex items-center mt-2 text-sm text-slate-500">
              <Clock className="w-4 h-4 mr-1" />
              Updates every {account.period || 30}s
            </div>
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
        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
          <Key className="w-4 h-4 mr-2" />
          Current TOTP Code
        </label>
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <code className="block w-full bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 px-6 py-4 rounded-xl text-3xl font-bold text-center tracking-[0.3em] text-slate-800 shadow-soft">
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
              <CheckCircle className="w-5 h-5 text-success-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Algorithm
          </label>
          <div className="text-lg font-semibold text-slate-800">
            {account.algorithm || 'SHA1'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Digits
          </label>
          <div className="text-lg font-semibold text-slate-800">
            {account.digits || 6}
          </div>
        </div>
      </div>

      {/* OTP Auth URL */}
      {account.otpauthUrl && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            OTP Auth URL
          </label>
          <div className="flex items-center space-x-3">
            <code className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs break-all text-slate-600 font-mono">
              {account.otpauthUrl || ''}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(account.otpauthUrl || '', urlId)}
              className="px-3 py-3"
            >
              {copiedId === urlId ? (
                <CheckCircle className="w-4 h-4 text-success-600" />
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