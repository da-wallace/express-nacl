import { PassThrough } from 'stream';

import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import multer from 'multer';
import chunker from 'stream-chunker';

import { ENC_CHUNK_SIZE, encryptTransform } from './nacl';
import { generateSecureUrl } from './url';

type StorageOpts = {
  s3: S3Client;
  bucket: string;
};

export interface StorageRequestBody extends Express.Request {
  body: {
    bucket: string;
  };
}

class SecureStorage implements multer.StorageEngine {
  private s3: S3Client;
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
    const { stream, originalname, size, mimetype } = file;

    const { url: secureUrl, nonce, key, hash } = generateSecureUrl();

    const readStream = stream;
    const s3 = this.s3;

    const pass = new PassThrough();

    const fileData = {
      Key: hash,
      Body: pass,
      Bucket: this.bucket,
    };

    readStream
      .pipe(chunker(ENC_CHUNK_SIZE, { flush: true }))
      .pipe(encryptTransform(key, nonce))
      .pipe(pass);

    const upload = new Upload({
      client: s3,
      leavePartsOnError: false, // optional manually handle dropped parts
      params: fileData,
    });

    upload
      .done()
      .then(() => {
        cb(null, {
          path: secureUrl,
          originalname,
          size,
          mimetype,
        });
      })
      .catch((err: Error) => {
        if (err) {
          cb(err);
        }
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
