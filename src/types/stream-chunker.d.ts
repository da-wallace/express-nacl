declare module 'stream-chunker' {
  import { Writable } from 'stream';

  type chunkerOpts = {
    flush: boolean;
  };

  function chunker(size: number, opts: chunkerOpts): Writable;

  export { chunker as default };
}
