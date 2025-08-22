import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, QrCode, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import TOTPDecoder from './totpDecoder'

interface TOTPAccount {
  issuer?: string
  account: string
  secret: string
  algorithm?: string
  digits?: number
  period?: number
  current_code: string
  otpauth_url?: string
}

interface DecodingResult {
  qrType: string
  accounts: TOTPAccount[]
}

interface ProgressRingProps {
  timeLeft: number
  period?: number
  size?: number
}

function App() {
  const [result, setResult] = useState<DecodingResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [accountTimers, setAccountTimers] = useState<Record<number, number>>({})

  // Calculate time left until next TOTP update based on real time for specific period
  const calculateTimeLeft = (period = 30) => {
    const now = Math.floor(Date.now() / 1000)
    return period - (now % period)
  }

  // Progress Ring Component
  const ProgressRing: React.FC<ProgressRingProps> = ({ timeLeft, period = 30, size = 24 }) => {
    const radius = (size - 4) / 2
    const circumference = 2 * Math.PI * radius
    const progress = (timeLeft / period) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-gray-600"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="text-green-400 transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono text-gray-300">
            {timeLeft}
          </span>
        </div>
      </div>
    )
  }

  // Auto-refresh TOTP codes synchronized with real TOTP time
  useEffect(() => {
    if (!result || !result.accounts || result.accounts.length === 0) return

    // Initialize timers for each account
    const initialTimers: { [key: number]: number } = {}
    result.accounts.forEach((account, index) => {
      const period = account.period || 30
      initialTimers[index] = calculateTimeLeft(period)
    })
    setAccountTimers(initialTimers)

    // Update codes and timers every second
    const interval = setInterval(() => {
      const decoder = new TOTPDecoder()
      let shouldUpdateCodes = false
      const newTimers: { [key: number]: number } = {}

      result.accounts.forEach((account, index) => {
        const period = account.period || 30
        const timeLeft = calculateTimeLeft(period)
        newTimers[index] = timeLeft

        // Check if this account needs code update
        if (timeLeft === period) {
          shouldUpdateCodes = true
        }
      })

      setAccountTimers(newTimers)

      // Update codes if any account reached its period
      if (shouldUpdateCodes) {
        setResult(prev => {
          if (!prev || !prev.accounts) return prev

          const updatedAccounts = prev.accounts.map(account => ({
            ...account,
            current_code: decoder.generateTOTPCode(
              account.secret,
              account.algorithm,
              account.digits,
              account.period
            )
          }))

          return {
            ...prev,
            accounts: updatedAccounts
          }
        })
      }
    }, 1000) // Check every second

    return () => clearInterval(interval)
  }, [result?.qrType])

  const processFile = async (file: File) => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const decoder = new TOTPDecoder()
      const data = await decoder.processFile(file)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  })

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            processFile(file)
          }
          break
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const copyToClipboard = async (text: string, index: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      // Copy failed silently
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-blue-400 mr-2" />
            <h1 className="text-3xl font-bold text-white">TOTP QR Decoder</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Drag and drop a QR code image or paste it from clipboard (Ctrl+V) to decode TOTP tokens
          </p>
        </div>

        {/* Upload Area */}
        <div className="card mb-8">
          <div
            {...getRootProps()}
            className={clsx(
              'dropzone cursor-pointer',
              isDragActive && 'active',
              loading && 'pointer-events-none opacity-50'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <Upload className={clsx(
                'w-12 h-12 mb-4 transition-colors',
                isDragActive ? 'text-blue-500' : 'text-gray-400'
              )} />
              <p className="text-lg font-medium text-gray-200 mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag image here'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                or click to select a file
              </p>
              <p className="text-xs text-gray-500">
                Supported: PNG, JPG, JPEG, GIF, BMP, WebP
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You can also paste image from clipboard (Ctrl+V)
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card text-center animate-fade-in">
            <div className="flex items-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-300">Processing QR code...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card border-red-600 bg-red-900/20 animate-slide-up">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <h3 className="font-medium text-red-300">Error</h3>
            </div>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && result.accounts && result.accounts.length > 0 && (
          <div className="card animate-slide-up">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              Decoding Results ({result.qrType})
            </h2>

            {result.accounts.map((account, index) => (
              <div key={index} className="card border-green-600 bg-green-900/20">
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
                        onClick={() => copyToClipboard(account.current_code, `code-${index}`)}
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
                        onClick={() => copyToClipboard(account.otpauth_url || '', `url-${index}`)}
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
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-gray-700">
        <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
          <span>Made with</span>
          <span className="text-red-400">❤️</span>
          <span>by</span>
          <a
            href="https://github.com/VizzleTF"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium hover:underline"
          >
            VizzleTF
          </a>
          <span>•</span>
          <a
            href="https://github.com/VizzleTF/TOTP_decoder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors text-xs hover:underline"
          >
            View Source
          </a>
        </p>
      </div>
    </div>
  )
}

export default App