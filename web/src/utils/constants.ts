export const ALGORITHM_MAP = {
  0: 'SHA-1',    // ALGORITHM_TYPE_UNSPECIFIED
  1: 'SHA-1',    // SHA1
  2: 'SHA-256',  // SHA256
  3: 'SHA-512',  // SHA512
  4: 'SHA-1'     // MD5 fallback to SHA-1
} as const

export const DIGITS_MAP = {
  0: 6,  // DIGIT_COUNT_UNSPECIFIED
  1: 6,  // SIX
  2: 8   // EIGHT
} as const

export const DEFAULT_PERIOD = 30
export const DEFAULT_DIGITS = 6
export const DEFAULT_ALGORITHM = 'SHA1'

export const SUPPORTED_IMAGE_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/webp': ['.webp']
} as const