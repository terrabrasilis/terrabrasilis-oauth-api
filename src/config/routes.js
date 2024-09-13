'use strict'

import mount from 'koa-mount';
import { getoauthjs, health, proxy, publicproxy, validate } from '../api';

export default function configRoutes (app) {
  app.use(mount('/validate', validate.routes()));
  app.use(mount('/getoauthjs', getoauthjs.routes()));
  app.use(mount('/health', health.routes()));
  app.use(mount('/proxy', proxy.routes()));
  app.use(mount('/publicproxy', publicproxy.routes()));

  // List Endpoints Here
}
