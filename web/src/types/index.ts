export interface TOTPAccount {
  issuer?: string
  account: string
  secret: string
  algorithm?: string
  digits?: number
  period?: number
  current_code: string
  otpauth_url?: string
}

export interface DecodingResult {
  qrType: string
  accounts: TOTPAccount[]
}

export interface ProgressRingProps {
  timeLeft: number
  period?: number
  size?: number
}

export interface TimerState {
  [accountIndex: number]: number
}

export interface CopyState {
  index: string | null
  timeout?: NodeJS.Timeout
}

export interface AppState {
  result: DecodingResult | null
  loading: boolean
  error: string
  copiedIndex: string | null
  accountTimers: TimerState
}