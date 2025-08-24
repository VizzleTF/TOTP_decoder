export const ALGORITHM_MAP = {
  0: 'SHA1',    // ALGORITHM_TYPE_UNSPECIFIED
  1: 'SHA1',    // SHA1
  2: 'SHA256',  // SHA256
  3: 'SHA512',  // SHA512
  4: 'SHA1'     // MD5 fallback to SHA1
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