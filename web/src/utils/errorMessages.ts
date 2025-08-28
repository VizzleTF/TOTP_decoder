import i18n from '../i18n'

export const getErrorMessage = (error: string): string => {
  const errorMap: Record<string, string> = {
    'No QR code found in image': i18n.t('errors.noQrFound'),
    'Unsupported QR code format': i18n.t('errors.unsupportedFormat'),
    'Failed to process file': i18n.t('errors.failedToProcess'),
    'Secret not found in URL': i18n.t('errors.noSecret'),
    'No data parameter in migration URL': i18n.t('errors.noData'),
    'Failed to load image': i18n.t('errors.failedToLoad'),
    'Canvas context not available': i18n.t('errors.canvasNotAvailable')
  }

  // Try to find exact match first
  if (errorMap[error]) {
    return errorMap[error]
  }

  // Try to find partial match
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return value
    }
  }

  return error // Return original error if no translation found
}