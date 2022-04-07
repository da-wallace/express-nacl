import { decode } from '@stablelib/base64';
import test from 'ava';

import { generateSecureUrl, parseSecureUrl } from './url';

const secureUrl = generateSecureUrl();

test('secureSecureUrl', (t) => {
  if (!secureUrl) {
    return t.fail();
  }

  t.pass();
});

test('parseSecureUrl', (t) => {
  const parsedUrl = parseSecureUrl(secureUrl.url);

  if (!parsedUrl) {
    return t.fail();
  }

  const testUrl = new URL(secureUrl.url);

  const hash = testUrl.pathname.replace('/', '');
  const keyParam = testUrl.searchParams.get('key');

  if (!keyParam) {
    return t.fail();
  }

  const key = decode(keyParam);
  const nonce = Uint8Array.from(Buffer.from(hash, 'hex'));

  t.is(parsedUrl, {
    hash,
    nonce,
    key,
  });
});
