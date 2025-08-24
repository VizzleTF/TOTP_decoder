import React from 'react'
import { CheckCircle } from 'lucide-react'
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

  return (
    <Card className="animate-slide-up">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
        Decoding Results ({result.type})
      </h2>

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
    </Card>
  )
}