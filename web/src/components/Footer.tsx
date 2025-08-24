import React from 'react'
import { Heart, Github, ExternalLink } from 'lucide-react'

export const Footer: React.FC = () => (
  <footer className="mt-20 pt-12 border-t border-slate-200">
    <div className="text-center fade-in">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-3 rounded-xl shadow-soft">
          <Heart className="w-5 h-5 text-error-500" />
        </div>
      </div>
      
      <p className="text-slate-600 mb-6 text-lg">
        Crafted with passion for security and simplicity
      </p>
      
      <div className="flex items-center justify-center space-x-8 mb-8">
        <a
          href="https://github.com/VizzleTF"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-slate-600 hover:text-primary-600 transition-colors duration-200 group"
        >
          <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">VizzleTF</span>
        </a>
        
        <div className="w-px h-6 bg-slate-300"></div>
        
        <a
          href="https://github.com/VizzleTF/TOTP_decoder"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-slate-600 hover:text-primary-600 transition-colors duration-200 group"
        >
          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm">View Source</span>
        </a>
      </div>
      
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 max-w-2xl mx-auto">
        <p className="text-sm text-slate-500 leading-relaxed">
          This application processes all data locally in your browser. 
          No information is transmitted to external servers, ensuring complete privacy and security.
        </p>
      </div>
    </div>
  </footer>
)