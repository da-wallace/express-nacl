import fs from 'fs';
import http from 'http';
import { Readable } from 'stream';

// import { S3Client } from '@aws-sdk/client-s3';
import { SecureUrl } from '@prisma/client';
import anyTest, { TestFn } from 'ava';
// import { mockClient } from 'aws-sdk-client-mock';
import { FormDataEncoder } from 'form-data-encoder';
import { FormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import fetch from 'node-fetch';

import { app } from './app';

const test = anyTest as TestFn<{
  prefixUrl: string;
  server: http.Server;
}>;

let secureUrl: SecureUrl;

test.before(async (t) => {
  t.context.server = app.listen(3000);
  t.context.prefixUrl = 'http://127.0.0.1:3000/';
});

test.after.always((t) => {
  t.context.server.close();
});

test.serial('post secure file', async (t) => {
  const form = new FormData();
  form.set(
    'file',
    await fileFromPath('test.jpg', 'test.jpg', {
      type: 'image/jpeg',
    })
  );
  const encoder = new FormDataEncoder(form);

  const options = {
    method: 'post',
    headers: encoder.headers,
    body: Readable.from(encoder),
  };

  const response = (await fetch(t.context.prefixUrl, options).then((res) =>
    res.json()
  )) as { data: SecureUrl };

  secureUrl = response.data;

  t.is(response.data.mimetype, 'image/jpeg');
  t.is(response.data.name, 'test.jpg');
  t.assert(response.data.id);
  t.assert(response.data.path);
});

test.serial('get secure file', async (t) => {
  const file = fs.readFileSync('test.jpg');

  const response = await fetch(t.context.prefixUrl + secureUrl.id).then((res) =>
    res.buffer()
  );

  t.is(response.length, file.length);
});

test.serial('delete s3 file', async (t) => {
  const options = {
    method: 'delete',
  };

  const response = await fetch(
    t.context.prefixUrl + secureUrl.id,
    options
  ).then((res) => res.json());

  t.is(response.success, true);
});
