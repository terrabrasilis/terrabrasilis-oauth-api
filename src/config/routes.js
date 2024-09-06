'use strict'

import mount from 'koa-mount';
import { getcapabilities, getoauthjs, health, proxy, validate } from '../api';

export default function configRoutes (app) {
  app.use(mount('/validate', validate.routes()));
  app.use(mount('/getoauthjs', getoauthjs.routes()));
  app.use(mount('/health', health.routes()));
  app.use(mount('/proxy', proxy.routes()));
  app.use(mount('/getcapabilities', getcapabilities.routes()));

  // List Endpoints Here
}
