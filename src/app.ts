import { Readable } from 'stream';

import { S3 } from '@aws-sdk/client-s3';
import { Prisma, PrismaClient } from '@prisma/client';
import env from 'env-var';
import express, { Request, Response } from 'express';
import multer from 'multer';
import chunker from 'stream-chunker';

import { DEC_CHUNK_SIZE, decryptTransform } from './lib/nacl';
import { secureStorage } from './lib/storage';
import { parseSecureUrl } from './lib/url';

export const app = express();

const BUCKET = env.get('BUCKET').required().asString();

const s3 = new S3({
  credentials: {
    accessKeyId: env.get('ACCESS_KEY').required().asString(),
    secretAccessKey: env.get('SECRET_KEY').required().asString(),
  },
  region: 'us-east-1',
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
      id,
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

  const response = await s3.getObject({ Key: hash, Bucket: BUCKET });

  res.setHeader('Content-Type', secureUrl.mimetype);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${secureUrl.name}"`
  );

  if (!response.Body) {
    return res.status(500).send({
      success: false,
      error: 'Unable to parse file',
    });
  }

  return (response.Body as Readable) // revisit this
    .pipe(chunker(DEC_CHUNK_SIZE, { flush: true }))
    .pipe(decryptTransform(key, nonce))
    .pipe(res);
});
