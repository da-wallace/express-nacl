import base64 from '@stablelib/base64';
import { box, randomBytes, secretbox } from 'tweetnacl';

import * as convert from './convert';

export function generateSecureUrl() {
  const nonceKeypair = box.keyPair();
  const nonce = nonceKeypair.publicKey.slice(0, 16);
  const hash = convert.uint8ArrayToHexadecimal(nonce);
  const key = randomBytes(secretbox.keyLength);

  return {
    url: `secure://${hash}?key=${encodeURIComponent(base64.encode(key))}`,
    key,
    nonce,
    hash,
  };
}

export function parseSecureUrl(url: string) {
  const policyUrl = new URL(url);

  const hash = policyUrl.pathname.replace('/', '');
  const keyParam = policyUrl.searchParams.get('key');

  if (!keyParam) {
    return false;
  }

  const key = base64.decode(keyParam);
  const nonce = Uint8Array.from(Buffer.from(hash, 'hex'));

  return {
    hash,
    nonce,
    key,
  };
}
