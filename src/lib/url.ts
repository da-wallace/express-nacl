import { decodeURLSafe, encodeURLSafe } from '@stablelib/base64';
import nacl from 'tweetnacl'; // older module

import * as convert from './convert';

/**
 * Generates a secure url for storage use
 */
export function generateSecureUrl() {
  const nonceKeypair = nacl.box.keyPair();
  const nonce = nonceKeypair.publicKey.slice(0, 16);
  const hash = convert.uint8ArrayToHexadecimal(nonce);
  const key = nacl.randomBytes(nacl.secretbox.keyLength);

  return {
    url: `secure://${hash}?key=${encodeURLSafe(key)}`,
    key,
    nonce,
    hash,
  };
}

/**
 * Parses a secure url from storage
 * @param url Secure URL
 */
export function parseSecureUrl(url: string) {
  const policyUrl = new URL(url);

  const hash = policyUrl.host.replace('/', '');
  const keyParam = policyUrl.searchParams.get('key');

  if (!keyParam) {
    return false;
  }

  const key = decodeURLSafe(keyParam);
  const nonce = Uint8Array.from(Buffer.from(hash, 'hex'));

  return {
    hash,
    nonce,
    key,
  };
}
