import AWS from 'aws-sdk';
import env from 'env-var';
import express, { Request, Response } from 'express';
import multer from 'multer';
import chunker from 'stream-chunker';

import { DEC_CHUNK_SIZE, decryptTransform } from './lib/nacl';
import { secureStorage } from './lib/storage';
import { parseSecureUrl } from './lib/url';

const app = express();

const PORT = env.get('PORT').asPortNumber() || 3000;
const BUCKET = env.get('BUCKET').required().asString();

const s3 = new AWS.S3({
  accessKeyId: env.get('ACCESS_KEY').required().asString(),
  secretAccessKey: env.get('SECRET_KEY').required().asString(),
});

app.post(
  '/',
  multer({
    storage: secureStorage({
      s3,
      bucket: BUCKET,
    }),
  }).single('file'),
  (req: Request, res: Response) => {
    if (req.file) {
      const { originalname, path } = req.file;

      return res.send({ originalname, path: encodeURIComponent(path) });
    }

    return res.status(500).send('File not present');
  }
);

app.get('/:secureUrl', async (req: Request, res: Response) => {
  if (req.file) {
    const { secureUrl } = req.params;

    if (!secureUrl) {
      return res.status(500).send('Secure URL param not provided');
    }

    const parsedUrl = parseSecureUrl(decodeURIComponent(secureUrl));

    if (!parsedUrl) {
      return res.status(500).send('Secure URL not recognized');
    }

    const { hash, key, nonce } = parsedUrl;

    const readStream = s3
      .getObject({ Key: hash, Bucket: BUCKET })
      .createReadStream();

    return readStream
      .pipe(chunker(DEC_CHUNK_SIZE, { flush: true }))
      .pipe(decryptTransform(key, nonce))
      .pipe(res);
  }

  return res.status(500).send('File not present');
});

app.listen(PORT, function () {
  console.log(`App is listening on port ${PORT} !`);
});
