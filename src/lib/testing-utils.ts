import { Stream } from 'stream';

/**
 * This is used only to test the buffer is the same
 * @param stream
 */
export async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<Uint8Array>();

    stream.on('data', (chunk) => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', (err) => reject(`error converting stream - ${err}`));
  });
}
