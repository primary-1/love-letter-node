import koa from 'koa';
import koaCors from '@koa/cors';
import koaBodyParser from 'koa-body';
import Router from 'koa-router';

import config from './config';
import * as thecampService from './thecamp/thecamp';

const router = new Router();

async function main() {
  const server = new koa();
  console.log(`SERVER LISTEN: ${config.server.port}`);

  server.listen(config.server.port);
  server.use(router.routes());
  server.use(koaBodyParser());
  server.use(router.allowedMethods());
  server.use(koaCors());
  router.use(koaCors())

  router.get('/', koaBodyParser(), async (ctx, next) => {
    ctx.body = 'hello!';
  })

  router.post('/letters', koaBodyParser(), async (ctx, next) => {
    thecampService.sendLetter(ctx);
  });

  router.get('/letters', koaBodyParser(), async (ctx, next) => {
    thecampService.getLetters(ctx);
  });
}

main();
