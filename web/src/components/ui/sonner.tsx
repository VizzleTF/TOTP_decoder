import type { CSSProperties } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/** theme="system" matches Tailwind's darkMode: 'media'; colors come from the page tokens. */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="system"
      position="bottom-center"
      className="!font-sans"
      style={
        {
          '--normal-bg': 'var(--surface-1)',
          '--normal-text': 'var(--ink)',
          '--normal-border': 'var(--line-strong)',
        } as CSSProperties
      }
      {...props}
    />
  )
}
