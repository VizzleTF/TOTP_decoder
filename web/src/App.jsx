import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, QrCode, Copy, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import clsx from 'clsx'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)

  const processFile = async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/decode?v=' + Date.now(), {
        method: 'POST',
        body: formData,
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decode QR code')
      }

      if (data.success) {
        // Детальная отладочная информация
        console.log('=== API Response Debug ===')
        console.log('Full response:', JSON.stringify(data, null, 2))
        console.log('Response type:', typeof data)
        
        if (data.accounts && data.accounts.length > 0) {
          data.accounts.forEach((account, index) => {
            console.log(`=== Account ${index} Debug ===`)
            console.log('Full account object:', JSON.stringify(account, null, 2))
            console.log('current_code value:', account.current_code)
            console.log('current_code type:', typeof account.current_code)
            console.log('current_code length:', account.current_code ? account.current_code.length : 'undefined')
            console.log('current_code as string:', String(account.current_code))
            console.log('current_code repr:', JSON.stringify(account.current_code))
            
            // Проверим каждый символ
            if (account.current_code) {
              const codeStr = String(account.current_code)
              console.log('Character by character:')
              for (let i = 0; i < codeStr.length; i++) {
                console.log(`  [${i}]: '${codeStr[i]}' (code: ${codeStr.charCodeAt(i)})`)
              }
            }
          })
        }
        
        console.log('Setting result state...')
        setResult(data)
        console.log('Result state set successfully')
      } else {
        throw new Error(data.error || 'Failed to decode QR code')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
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
    const handlePaste = async (e) => {
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

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">TOTP QR Decoder</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Перетащите изображение с QR-кодом или вставьте его из буфера обмена (Ctrl+V) для декодирования TOTP токенов
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
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Отпустите файл здесь' : 'Перетащите изображение сюда'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                или нажмите для выбора файла
              </p>
              <p className="text-xs text-gray-400">
                Поддерживаются: PNG, JPG, JPEG, GIF, BMP, WebP
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Также можно вставить изображение из буфера обмена (Ctrl+V)
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
            <p className="text-gray-600">Обрабатываем QR-код...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card border-red-200 bg-red-50 animate-slide-up">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="font-medium text-red-800">Ошибка</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && result.accounts && result.accounts.length > 0 && (
          <div className="card animate-slide-up">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Результаты декодирования ({result.qr_type})
            </h2>

            {result.accounts.map((account, index) => (
              <div key={index} className="card border-green-200 bg-green-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-800">
                        {account.issuer || 'Unknown Service'}
                      </h3>
                      <p className="text-green-700">{account.account}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm font-mono">
                      {account.period || 30}s
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TOTP Code
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border text-lg font-mono text-center tracking-wider">
                        {account.current_code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(account.current_code, `code-${index}`)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copy code"
                      >
                        {copiedIndex === `code-${index}` ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Algorithm / Digits
                    </label>
                    <div className="bg-white px-3 py-2 rounded border text-sm">
                      {account.algorithm || 'SHA1'} / {account.digits || 6} digits
                    </div>
                  </div>
                </div>

                {account.otpauth_url && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OTP Auth URL
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border text-xs break-all">
                        {account.otpauth_url}
                      </code>
                      <button
                        onClick={() => copyToClipboard(account.otpauth_url, `url-${index}`)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copy URL"
                      >
                        {copiedIndex === `url-${index}` ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
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
    </div>
  )
}

export default App