export function getTimeLeft(period: number = 30): number {
  const now = Date.now() / 1000
  return period - (now % period)
}
