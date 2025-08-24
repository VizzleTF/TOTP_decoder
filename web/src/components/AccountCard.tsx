import React from 'react'
import { CheckCircle, Copy } from 'lucide-react'
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
    <Card variant="success" className="mb-4">
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
        <ProgressRing
          timeLeft={timeLeft}
          period={account.period}
          size={32}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Algorithm / Digits
          </label>
          <div className="bg-gray-800 border border-gray-600 px-3 py-2 rounded text-lg font-mono text-center text-white">
            {account.algorithm} / {account.digits} digits
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            TOTP Code
          </label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-gray-800 border border-gray-600 px-3 py-2 rounded text-lg font-mono text-center text-white">
              {account.currentCode}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(account.currentCode, codeId)}
              title="Copy code"
            >
              {copiedId === codeId ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {account.otpauthUrl && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            OTP Auth URL
          </label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-gray-800 border border-gray-600 px-3 py-2 rounded text-xs break-all text-white">
              {account.otpauthUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(account.otpauthUrl, urlId)}
              title="Copy URL"
            >
              {copiedId === urlId ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
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