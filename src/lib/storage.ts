import { PassThrough } from 'stream';

import * as AWS from 'aws-sdk';
import multer from 'multer';
import chunker from 'stream-chunker';

import { ENC_CHUNK_SIZE, encryptTransform } from './nacl';
import { generateSecureUrl } from './url';

type StorageOpts = {
  s3: AWS.S3;
  bucket: string;
};

export interface StorageRequestBody extends Express.Request {
  body: {
    bucket: string;
  };
}

class SecureStorage implements multer.StorageEngine {
  private s3: AWS.S3;
  private bucket: string;

  constructor(opts: StorageOpts) {
    this.s3 = opts.s3;
    this.bucket = opts.bucket;
  }

  _handleFile(
    _: StorageRequestBody,
    file: Express.Multer.File,
    cb: (error?: Error | null, info?: Partial<Express.Multer.File>) => void
  ) {
    const { stream, originalname, size } = file;

    const { url: secureUrl, nonce, key, hash } = generateSecureUrl();

    const readStream = stream;
    const s3 = this.s3;

    const uploadFromStream = () => {
      const pass = new PassThrough();
      const fileData = {
        Key: hash,
        Body: pass,
        Bucket: this.bucket,
      };
      const promise = s3.upload(fileData).promise();
      return {
        writeStream: pass,
        promise,
      };
    };

    const uploadStream = uploadFromStream();

    readStream
      .pipe(chunker(ENC_CHUNK_SIZE, { flush: true }))
      .pipe(encryptTransform(key, nonce))
      .pipe(uploadStream.writeStream);

    uploadStream.promise.then(() => {
      cb(null, {
        path: secureUrl,
        originalname,
        size,
      });
    });
  }
  /**
   * This function isn't needed. Because we are streaming
   * the contents to s3.
   * @returns void
   */
  _removeFile(): void {
    return;
  }
}

export function secureStorage(opts: StorageOpts) {
  return new SecureStorage(opts);
}
