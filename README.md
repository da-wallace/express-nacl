# Express-NaCl

Encryption? Still relying on S3 to encrypt your files? Well do I have a solution for you. This quick example shows and easy way of encrypting your files in transit using a fun library called NaCl(Salt). It was more a lesson in using streaming and encryption in route. There's also some fun ideas about how to store/parse salts and file names. All presented as research done and shared.

## Libraries

- [Ava](https://github.com/ava) Node.js test runner that lets you develop with confidence 🚀
- [Express](https://expressjs.com) Fast, not opinionated, minimalist web framework for Node.js
- [Multer](https://github.com/expressjs/multer) Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.
- [TweetNaCl](https://tweetnacl.js.org/#/) TweetNaCl.js is a port of TweetNaCl / NaCl to JavaScript. It implements secret-key authenticated encryption, public-key authenticated encryption, hashing, and public-key signatures. High-level crypto library in only 7 KB (minified and gzipped)!
- [AWS SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html) AWS SDK for JavaScript S3 Client for Node.js, Browser and React Native.
- [Prisma](https://github.com/prisma/prisma) Prisma is a next-generation ORM. This is entirely unnecessary. Was used only to complete the idea.
- [NaCl Stream](https://github.com/dchest/nacl-stream-js) Splits stream into chucks then 24-byte fullNonce is acquired by concatenating 16-byte nonce and 8-byte little-endian chunk number. (I've included rudimentary types for this library)
- [Stream Chunker](https://github.com/creativecreature/stream-chunker) This module implements the Node transform stream interface. It keeps an internal buffer of a given size, and will spit out a chunk each time it fills up.

## Getting Stared

Clone the repo

```bash
git clone https://github.com/da-wallace/express-nacl
```

From there set up a `.env` file
```bash
ACCESS_KEY=
SECRET_KEY=
BUCKET=
```

After that: 
- You'll be able to post to the root of your `localhost:3000`.
- This will return a record stored in sqlite
- You can take the `ID` of that record and use it for retrieving the file `localhost:3000/:id`