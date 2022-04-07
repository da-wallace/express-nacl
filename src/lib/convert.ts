export function uint8ArrayToHexadecimal(uint8arr: Uint8Array) {
  if (!(uint8arr instanceof Uint8Array)) {
    throw new TypeError(
      'Wrong data type of array of 8-bit integers. Uint8Array is expected'
    );
  }

  return Buffer.from(uint8arr).toString('hex');
}

export function hexadecimalToUint8Array(hex: string) {
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}
