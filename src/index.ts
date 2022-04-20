// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import env from 'env-var';

import { app } from './app';

const PORT = env.get('PORT').asPortNumber() || 3000;

app.listen(PORT, function () {
  console.log(`App is listening on port ${PORT} !`);
});
