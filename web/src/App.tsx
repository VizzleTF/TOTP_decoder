import React from 'react'
import { Analytics } from '@vercel/analytics/react'
import { useQRDecoder } from './hooks/useQRDecoder'
import { useTimer } from './hooks/useTimer'
import { useClipboard } from './hooks/useClipboard'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { FileUploader } from './components/FileUploader'
import { ResultsList } from './components/ResultsList'
import { Loading, Error } from './components/StatusMessage'

export default function App() {
  const { result, loading, error, decode } = useQRDecoder()
  const timers = useTimer(result?.accounts || [])
  const { copiedId, copy } = useClipboard(decode)

  return (
    <div className="min-h-screen animated-gradient">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Header />
        <FileUploader onUpload={decode} loading={loading} />
        <Loading loading={loading} />
        <Error error={error} />
        {result && (
          <ResultsList
            result={result}
            timers={timers}
            copiedId={copiedId}
            onCopy={copy}
          />
        )}
      </div>
      <div className="max-w-4xl mx-auto px-6">
        <Footer />
      </div>
      <Analytics />
    </div>
  )
}