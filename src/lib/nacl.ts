import { Transform } from 'stream';

import nacl from 'nacl-stream';

export const ENC_CHUNK_SIZE = 2 ** 20;
export const DEC_CHUNK_SIZE = 2 ** 20 + 20;

/**
 * Used to create an encryption transform for streaming.
 * @param key
 * @param nonce
 */
export const encryptTransform = (key: Uint8Array, nonce: Uint8Array) => {
  const encryptor = nacl.stream.createEncryptor(key, nonce, ENC_CHUNK_SIZE);
  return new Transform({
    transform(chunk, _, done) {
      const isLast = chunk.length < ENC_CHUNK_SIZE;
      const encryptedChunk = encryptor.encryptChunk(chunk, isLast);

      if (!encryptedChunk) {
        throw new Error('Encryption failed');
      }

      this.push(encryptedChunk);
      if (isLast) encryptor.clean();
      done();
    },
  });
};

/**
 * Used to create an decryption transform for streaming.
 * @param key
 * @param nonce
 */
export const decryptTransform = (key: Uint8Array, nonce: Uint8Array) => {
  const decryptor = nacl.stream.createDecryptor(key, nonce, DEC_CHUNK_SIZE);
  return new Transform({
    transform(chunk, _, done) {
      const isLast = chunk.length < DEC_CHUNK_SIZE;
      const decryptedChunk = decryptor.decryptChunk(chunk, isLast);

      if (!decryptedChunk) {
        throw Error('Decryption failed');
      }
      this.push(decryptedChunk);

      if (isLast) decryptor.clean();
      done();
    },
  });
};
