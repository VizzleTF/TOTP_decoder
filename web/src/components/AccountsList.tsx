import React from 'react'
import { CheckCircle, Copy } from 'lucide-react'
import { DecodingResult, TimerState } from '../types'
import { ProgressRing } from './ProgressRing'

interface AccountsListProps {
  result: DecodingResult
  accountTimers: TimerState
  copiedIndex: string | null
  onCopyToClipboard: (text: string, index: string) => void
}

export const AccountsList: React.FC<AccountsListProps> = ({
  result,
  accountTimers,
  copiedIndex,
  onCopyToClipboard
}) => {
  if (!result.accounts || result.accounts.length === 0) {
    return null
  }

  return (
    <div className="card animate-slide-up">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
        Decoding Results ({result.qrType})
      </h2>

      {result.accounts.map((account, index) => (
        <div key={index} className={`card border-green-600 bg-green-900/20 ${index < result.accounts.length - 1 ? 'mb-4' : ''}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-300">
                  {account.issuer || 'Unknown Service'}
                </h3>
                <p className="text-green-200">{account.account}</p>
              </div>
            </div>
            <div className="flex items-center text-green-400">
              <ProgressRing
                timeLeft={accountTimers[index] || 0}
                period={account.period || 30}
                size={32}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Algorithm / Digits
              </label>
              <div className="bg-gray-800 border border-gray-600 px-3 py-2 rounded text-lg font-mono text-center tracking-wider text-white">
                {account.algorithm || 'SHA1'} / {account.digits || 6} digits
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                TOTP Code
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-800 border border-gray-600 px-3 py-2 rounded text-lg font-mono text-center tracking-wider text-white">
                  {account.current_code}
                </code>
                <button
                  onClick={() => onCopyToClipboard(account.current_code, `code-${index}`)}
                  className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                  title="Copy code"
                >
                  {copiedIndex === `code-${index}` ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {account.otpauth_url && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                OTP Auth URL
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-800 border border-gray-600 px-3 py-2 rounded text-xs break-all text-white">
                  {account.otpauth_url || ''}
                </code>
                <button
                  onClick={() => onCopyToClipboard(account.otpauth_url || '', `url-${index}`)}
                  className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                  title="Copy URL"
                >
                  {copiedIndex === `url-${index}` ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}