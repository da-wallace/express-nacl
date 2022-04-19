import fs from 'fs';
import { PassThrough } from 'stream';

import test from 'ava';
import chunker from 'stream-chunker';

import {
  DEC_CHUNK_SIZE,
  decryptTransform,
  ENC_CHUNK_SIZE,
  encryptTransform,
} from './nacl';
import { stream2buffer } from './testing-utils';
import { generateSecureUrl } from './url';

const decStream = new PassThrough();
const encStream = new PassThrough();

const secureUrl = generateSecureUrl();

test.serial('encryptFile', (t) => {
  const readStream = fs.createReadStream('test.jpg');

  return new Promise((resolve) => {
    readStream
      .pipe(chunker(ENC_CHUNK_SIZE, { flush: true }))
      .pipe(encryptTransform(secureUrl.key, secureUrl.nonce))
      .pipe(encStream)
      .on('finish', () => {
        t.pass();
        resolve();
      })
      .on('error', () => {
        t.fail();
        resolve();
      });
  });
});

test.serial('decryptFile', (t) => {
  const file = fs.readFileSync('test.jpg');

  return new Promise((resolve) => {
    encStream
      .pipe(chunker(DEC_CHUNK_SIZE, { flush: true }))
      .pipe(decryptTransform(secureUrl.key, secureUrl.nonce))
      .pipe(decStream)

      .on('finish', () => {
        stream2buffer(decStream)
          .then((buffer) => {
            t.is(file.length, buffer.length);
            resolve();
          })
          .catch((err) => {
            t.fail(err.message);
          });
      });
  });
});
