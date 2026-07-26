import React, { useEffect, useRef } from 'react'

const SPACING = 28
const AMPLITUDE = 8
const MOUSE_RADIUS = 640
const MOUSE_PUSH = 22

/**
 * Subtle animated dot-wave background (three.js webgl_points_waves style)
 * rendered on plain Canvas 2D — zero dependencies. Dots gently breathe with
 * crossed sine waves and react to the pointer (repulsion + highlight).
 * Respects theme and prefers-reduced-motion, pauses when the tab is hidden.
 */
export const DotWave: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const darkScheme = window.matchMedia('(prefers-color-scheme: dark)')

    let width = 0
    let height = 0
    let raf = 0
    let dotColor = ''
    let dotAlpha = 0.2

    // Pointer state — target follows events, smoothed position follows target
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0 }

    const readTheme = () => {
      const styles = getComputedStyle(document.documentElement)
      dotColor = styles.getPropertyValue('--dot').trim() || '128, 128, 128'
      dotAlpha = parseFloat(styles.getPropertyValue('--dot-alpha')) || 0.2
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)

      // Smooth pointer follow + strength fade in/out
      mouse.x += (mouse.tx - mouse.x) * 0.12
      mouse.y += (mouse.ty - mouse.y) * 0.12
      const targetStrength = mouse.tx > -9000 ? 1 : 0
      mouse.strength += (targetStrength - mouse.strength) * 0.08

      const cols = Math.ceil(width / SPACING) + 2
      const rows = Math.ceil(height / SPACING) + 2
      const r2 = MOUSE_RADIUS * MOUSE_RADIUS

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = i * SPACING
          // Two crossed sine fields — slow "breathing" wave
          const phase =
            Math.sin(i * 0.35 + t) * Math.cos(j * 0.28 + t * 0.7)
          let y = j * SPACING + phase * AMPLITUDE
          const norm = (phase + 1) / 2 // 0..1 for depth cues
          let radius = 0.8 + norm * 0.9
          let alpha = dotAlpha * (0.35 + norm * 0.65)

          // Pointer influence — radial repulsion + highlight
          if (mouse.strength > 0.01) {
            const dx = x - mouse.x
            const dy = y - mouse.y
            const d2 = dx * dx + dy * dy
            if (d2 < r2) {
              const d = Math.sqrt(d2) || 1
              const falloff = 1 - d / MOUSE_RADIUS // 1 at cursor, 0 at edge
              const force = falloff * falloff * mouse.strength
              x += (dx / d) * force * MOUSE_PUSH
              y += (dy / d) * force * MOUSE_PUSH
              radius += force * 1.1
              alpha = Math.min(1, alpha + force * dotAlpha * 1.5)
            }
          }

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${dotColor}, ${alpha})`
          ctx.fill()
        }
      }
    }

    const loop = () => {
      draw(performance.now() * 0.0006)
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      if (reducedMotion.matches) {
        draw(0) // static frame
      } else {
        raf = requestAnimationFrame(loop)
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      mouse.tx = e.clientX
      mouse.ty = e.clientY
    }

    const onPointerLeave = () => {
      mouse.tx = -9999
      mouse.ty = -9999
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else {
        start()
      }
    }

    const onThemeChange = () => {
      readTheme()
      if (reducedMotion.matches) draw(0)
    }

    readTheme()
    resize()
    start()

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)
    darkScheme.addEventListener('change', onThemeChange)
    reducedMotion.addEventListener('change', start)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      darkScheme.removeEventListener('change', onThemeChange)
      reducedMotion.removeEventListener('change', start)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none [mask-image:radial-gradient(130%_90%_at_50%_0%,black_20%,transparent_75%)]"
    />
  )
}
