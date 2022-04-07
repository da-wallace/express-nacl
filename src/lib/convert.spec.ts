import test from 'ava';

import { hexadecimalToUint8Array, uint8ArrayToHexadecimal } from './convert';

const hex = 'FFFFFF';

test('hexadecimalToUint8Array', (t) => {
  t.like(
    hexadecimalToUint8Array(hex),
    Uint8Array.from(Buffer.from(hex, 'hex'))
  );
});

test('uint8ArrayToHexadecimal', (t) => {
  const unit8 = hexadecimalToUint8Array(hex);
  t.is(uint8ArrayToHexadecimal(unit8), Buffer.from(unit8).toString('hex'));
});
