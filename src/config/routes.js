'use strict'

import mount from 'koa-mount'
import { validate, getoauthjs, health, proxy } from '../api'

export default function configRoutes (app) {
  app.use(mount('/validate', validate.routes()));
  app.use(mount('/getoauthjs', getoauthjs.routes()));
  app.use(mount('/health', health.routes()));
  app.use(mount('/proxy', proxy.routes()));

  // List Endpoints Here
}
