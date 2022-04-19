/**
 * Converts a uint8array to a hexadecimal
 * @param uint8arr Uint8Array
 */
export function uint8ArrayToHexadecimal(uint8arr: Uint8Array) {
  return Buffer.from(uint8arr).toString('hex');
}

/**
 * Converts a hexadecimal to a uint8array
 * @param hex Hex
 */
export function hexadecimalToUint8Array(hex: string) {
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}
