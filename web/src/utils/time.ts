export function getCurrentTimeStep(period: number = 30): number {
  return Math.floor(Date.now() / 1000 / period)
}

export function getTimeLeft(period: number = 30): number {
  const now = Date.now() / 1000
  return period - (now % period)
}

export function formatTime(seconds: number): string {
  return seconds.toString().padStart(2, '0')
}