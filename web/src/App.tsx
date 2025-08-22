import React from 'react'
import { useAccountsManager } from './hooks/useAccountsManager'
import { useClipboard } from './hooks/useClipboard'
import {
  Header,
  Footer,
  QRUploader,
  AccountsList,
  LoadingMessage,
  ErrorMessage
} from './components'

function App() {
  const { result, accountTimers, loading, error, processFile } = useAccountsManager()
  const { copiedIndex, copyToClipboard } = useClipboard(processFile)



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Header />
        <QRUploader onFileUpload={processFile} loading={loading} />
        <LoadingMessage loading={loading} />
        <ErrorMessage error={error} />
        {result && (
          <AccountsList
            result={result}
            accountTimers={accountTimers}
            copiedIndex={copiedIndex}
            onCopyToClipboard={copyToClipboard}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}

export default App