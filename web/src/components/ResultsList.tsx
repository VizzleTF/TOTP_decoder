import React from 'react'
import { Sparkles, Users, Smartphone } from 'lucide-react'
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
    <div className="slide-up" id="results-section">
      {/* Results Header */}
      <Card className="mb-12 text-center" variant="glass">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 rounded-2xl shadow-soft mr-5">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-soft">
            <TypeIcon className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          Successfully Decoded!
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
          Found <span className="font-semibold text-blue-600 dark:text-blue-400">{result.accounts.length}</span> account
          {result.accounts.length !== 1 ? 's' : ''} from your <span className="font-semibold">{getTypeLabel()}</span>
        </p>
        
        <div className="inline-flex items-center px-6 py-3 bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-medium backdrop-blur-sm">
          <Sparkles className="w-4 h-4 mr-2" />
          All codes are generating securely
        </div>
      </Card>

      {/* Account Cards */}
      <div className="space-y-8">
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