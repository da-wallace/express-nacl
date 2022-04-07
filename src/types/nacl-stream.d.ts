declare module 'nacl-stream' {
  class StreamEncryptor {
    encryptChunk: (chunk: Uint8Array, isLast: boolean) => Uint8Array | null;
    decryptChunk: (chunk: Uint8Array, isLast: boolean) => Uint8Array | null;
    clean: () => void;
  }

  interface stream {
    createEncryptor: (
      key: Uint8Array,
      nonce: Uint8Array,
      maxChunkLength: number
    ) => StreamEncryptor;

    createDecryptor: (
      key: Uint8Array,
      nonce: Uint8Array,
      maxChunkLength: number
    ) => StreamEncryptor;

    readChunkLength: (data: Uint8Array, offset?: number) => number;
  }

  export const stream: stream;
}
