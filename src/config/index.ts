import * as env from 'dotenv';
env.config();

export default {
  thecamp: {
    credential: {
      id: process.env.THECAMP_ID,
      password: process.env.THECAMP_PASSWORD,
    },
  },
  server: {
    port: process.env.PORT,
  },
}