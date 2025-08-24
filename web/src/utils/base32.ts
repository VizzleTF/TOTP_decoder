const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function uint8ArrayToBase32(bytes: Uint8Array): string {
  let result = ''
  let buffer = 0
  let bitsLeft = 0

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte
    bitsLeft += 8

    while (bitsLeft >= 5) {
      result += BASE32_CHARS[(buffer >> (bitsLeft - 5)) & 31]
      bitsLeft -= 5
    }
  }

  if (bitsLeft > 0) {
    result += BASE32_CHARS[(buffer << (5 - bitsLeft)) & 31]
  }

  return result
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return bytes
}