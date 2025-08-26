import React from 'react'
import { Github, ExternalLink } from 'lucide-react'

export const Footer: React.FC = () => (
  <footer className="mt-20 pt-12 border-t border-slate-200">
    <div className="text-center fade-in">
      <div className="flex items-center justify-center space-x-8 mb-8">
        <a
          href="https://github.com/VizzleTF"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors duration-200 group"
        >
          <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">VizzleTF</span>
        </a>
        
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
        
        <a
          href="https://github.com/VizzleTF/TOTP_decoder"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors duration-200 group"
        >
          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm">View Source</span>
        </a>
      </div>
    </div>
  </footer>
)