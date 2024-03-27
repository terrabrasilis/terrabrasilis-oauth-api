'use strict'

import config from './index'
import morgan from 'koa-morgan'
import parser from 'koa-bodyparser'
import cors from '@koa/cors'
import compress from 'koa-compress'
import jwt from 'koa-jwt'
import { get, includes } from 'lodash'


export default function configKoa (app) {

  const serve = require('koa-static');
  app.use(serve('./assets/'));

  app.use(compress())
  app.use(cors())
  app.use(parser({
    strict: false
  }))

  app.use(jwt({
    secret: config.secret,
    passthrough: true,
    clockTolerance: 600000 //10 min
    }))

  app.use(async (ctx, next) => {
    const error = get(ctx, 'state.jwtOriginalError.message')
    const IS_FORBIDDEN = includes(error, 'invalid') || includes(error, 'expired')

    if (IS_FORBIDDEN) {
      ctx.status = 401
      ctx.body = { error }
      return
    }

    ctx.body = ctx.request.body
    ctx.config = config;    
    return await next()
  })

  app.on('error', err => console.error(err))

  app.use(morgan(config.logType))

}
