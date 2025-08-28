import React from 'react'
import { Shield, Check, Key, Copy } from 'lucide-react'
import { TOTPAccount } from '../types/core'
import { Card } from './ui/Card'
import { ProgressRing } from './ui/ProgressRing'
import { useI18n } from '../hooks/useI18n'

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
  const { t } = useI18n()
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
              {account.issuer || t('account.service')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">{account.account}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="relative p-1 rounded-xl" style={{
              background: `conic-gradient(from 0deg, ${
                (timeLeft / (account.period || 30)) * 100 > 50 ? 'rgb(34, 197, 94)' :
                (timeLeft / (account.period || 30)) * 100 > 25 ? 'rgb(234, 179, 8)' : 'rgb(239, 68, 68)'
              } ${((timeLeft / (account.period || 30)) * 360)}deg, transparent ${((timeLeft / (account.period || 30)) * 360)}deg, transparent 360deg)`
            }}>
              <code 
                className={`block glass-card px-6 py-4 rounded-lg text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-wider cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 relative group`}
                onClick={() => onCopy(account.currentCode || '000000', codeId)}
              >
                <span className="relative z-10">{account.currentCode || '000000'}</span>
                <div className="absolute top-1 right-1 z-20">
                  {copiedId === codeId ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Auth URL */}
      {account.otpauthUrl && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            {t('account.otpAuthUrl')}
          </label>
          <div className="relative">
            <code 
              className="block glass-card px-5 py-4 rounded-xl text-xs break-all text-slate-600 dark:text-slate-300 font-mono cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 relative group"
              onClick={() => onCopy(account.otpauthUrl || '', urlId)}
            >
              {account.otpauthUrl}
              <div className="absolute top-2 right-2">
                {copiedId === urlId ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </code>
          </div>
        </div>
      )}
    </Card>
  )
}