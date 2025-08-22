import React from 'react'
import { QrCode } from 'lucide-react'

export const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <QrCode className="w-8 h-8 text-blue-400 mr-2" />
        <h1 className="text-3xl font-bold text-white">TOTP QR Decoder</h1>
      </div>
      <p className="text-gray-300 max-w-2xl mx-auto">
        Drag and drop a QR code image or paste it from clipboard (Ctrl+V) to decode TOTP tokens
      </p>
    </div>
  )
}