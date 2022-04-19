import test from 'ava';

import { hexadecimalToUint8Array, uint8ArrayToHexadecimal } from './convert';

const hex = 'ffffff';

test('hexadecimalToUint8Array', (t) => {
  const expected = Uint8Array.from(Buffer.from(hex, 'hex'));
  const test = hexadecimalToUint8Array(hex);

  /**
   * Conversion to string is necessary for comparison of arrays
   */
  t.is(test.toString(), expected.toString());
});

test('uint8ArrayToHexadecimal', (t) => {
  const unit8 = hexadecimalToUint8Array(hex);
  t.is(uint8ArrayToHexadecimal(unit8), Buffer.from(unit8).toString('hex'));
});
