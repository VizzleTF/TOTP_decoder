export interface TOTPAccount {
  issuer: string
  account: string
  secret: string
  algorithm: string
  digits: number
  period: number
  currentCode: string
  otpauthUrl: string
}

export interface DecodingResult {
  type: 'standard' | 'migration'
  accounts: TOTPAccount[]
}

export interface AppError {
  message: string
  code?: string
}

export interface TimerState {
  [accountIndex: number]: number
}