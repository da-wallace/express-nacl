// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { Prisma, PrismaClient } from '@prisma/client';
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

const prisma = new PrismaClient();

app.post(
  '/',
  multer({
    storage: secureStorage({
      s3,
      bucket: BUCKET,
    }),
  }).single('file'),
  async (req: Request, res: Response) => {
    if (req.file) {
      const { originalname: name, path, mimetype } = req.file;

      try {
        const data = await prisma.secureUrl.create({
          data: {
            name,
            path,
            mimetype,
          },
        });

        return res.send({ success: true, data });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          return res.status(500).send({ success: false, error: e.message });
        }
      }
    }

    return res.status(500).send({
      success: false,
      error: 'File not present',
    });
  }
);

app.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const secureUrl = await prisma.secureUrl.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!secureUrl) {
    return res.status(404).send({
      success: false,
      error: 'Not found',
    });
  }

  const parsedUrl = parseSecureUrl(secureUrl.path);

  if (!parsedUrl) {
    return res.status(500).send({
      success: false,
      error: 'Secure URL not recognized',
    });
  }

  const { hash, key, nonce } = parsedUrl;

  const readStream = s3
    .getObject({ Key: hash, Bucket: BUCKET })
    .createReadStream();

  res.setHeader('Content-Type', secureUrl.mimetype);
  res.setHeader('Content-Disposition', `attachment; ${secureUrl.name}`);

  return readStream
    .pipe(chunker(DEC_CHUNK_SIZE, { flush: true }))
    .pipe(decryptTransform(key, nonce))
    .pipe(res);
});

app.listen(PORT, function () {
  console.log(`App is listening on port ${PORT} !`);
});
