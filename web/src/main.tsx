import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { DotWave } from './components/DotWave'
import './index.css'
import './i18n'

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Background canvas lives outside the content flow so it stays behind the
// static prose instead of inheriting its stacking context.
const bgElement = document.getElementById('bg');
if (bgElement) {
  ReactDOM.createRoot(bgElement).render(<DotWave />)
}
