import React from 'react'
import { Github, ExternalLink } from 'lucide-react'

export const Footer: React.FC = () => (
  <footer className="mt-24 pt-12 border-t border-slate-200/60 dark:border-slate-700/50">
    <div className="text-center fade-in">
      <div className="flex items-center justify-center space-x-8 mb-6">
        <a
          href="https://github.com/VizzleTF"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
        >
          <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">VizzleTF</span>
        </a>
        
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
        
        <a
          href="https://github.com/VizzleTF/TOTP_decoder"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
        >
          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium">View Source</span>
        </a>
      </div>
      
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Made with precision and care for your security
      </p>
    </div>
  </footer>
)