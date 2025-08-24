import React from 'react'
import { CheckCircle, Users, Smartphone } from 'lucide-react'
import { DecodingResult, TimerState } from '../types/core'
import { Card } from './ui/Card'
import { AccountCard } from './AccountCard'

interface ResultsListProps {
  result: DecodingResult
  timers: TimerState
  copiedId: string | null
  onCopy: (text: string, id: string) => void
}

export const ResultsList: React.FC<ResultsListProps> = ({
  result,
  timers,
  copiedId,
  onCopy
}) => {
  if (!result.accounts.length) return null

  const getTypeIcon = () => {
    return result.type === 'migration' ? Users : Smartphone
  }

  const getTypeLabel = () => {
    return result.type === 'migration' ? 'Migration QR Code' : 'Standard TOTP'
  }

  const TypeIcon = getTypeIcon()

  return (
    <div className="slide-up">
      {/* Results Header */}
      <Card className="mb-8 text-center" variant="glass">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-success-500 to-success-600 p-3 rounded-xl shadow-soft mr-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 rounded-xl shadow-soft">
            <TypeIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Successfully Decoded!
        </h2>
        
        <p className="text-slate-600 mb-4">
          Found <span className="font-semibold text-primary-600">{result.accounts.length}</span> account
          {result.accounts.length !== 1 ? 's' : ''} from your <span className="font-semibold">{getTypeLabel()}</span>
        </p>
        
        <div className="inline-flex items-center px-4 py-2 bg-success-100 text-success-800 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4 mr-2" />
          All codes are generating securely
        </div>
      </Card>

      {/* Account Cards */}
      <div className="space-y-6">
        {result.accounts.map((account, index) => (
          <AccountCard
            key={index}
            account={account}
            timeLeft={timers[index] || 0}
            copiedId={copiedId}
            onCopy={onCopy}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}