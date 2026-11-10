import i18n from '../i18n'

// Message thrown by the decoder -> locale key of the text shown to the user
const ERROR_KEYS: Record<string, string> = {
  'No QR code found in image': 'errors.noQrFound',
  'Unsupported QR code format': 'errors.unsupportedFormat',
  'Secret not found in URL': 'errors.noSecret',
  // Thrown by totp-generator
  'Invalid base32 character in key': 'errors.invalidSecret',
  'No data parameter in migration URL': 'errors.noData',
  'Failed to load image': 'errors.failedToLoad',
  'Canvas context not available': 'errors.canvasNotAvailable'
}

export const getErrorMessage = (error: string): string => {
  const key = ERROR_KEYS[error]
  return key ? i18n.t(key) : i18n.t('errors.unknown', { detail: error })
}
