import React from 'react'

export const Footer: React.FC = () => {
  return (
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
  )
}