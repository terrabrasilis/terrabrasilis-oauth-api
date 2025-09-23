'use strict'

import cors from '@koa/cors'
import parser from 'koa-bodyparser'
import compress from 'koa-compress'
import morgan from 'koa-morgan'
import config from './index'


export default function configKoa (app) {

  const serve = require('koa-static');
  app.use(serve('./assets/'));

  app.use(compress())
  app.use(cors())
  
  app.use(parser({
    strict: false
  }))

  // app.use(jwt({
  //   secret: config.secret,
  //   passthrough: true,
  //   clockTolerance: 60000000, //10 min,
  //   algorithms: 'RS256'
  //   }))

  app.use(async (ctx, next) => {

    ctx.body = ctx.request.body
    ctx.config = config;    
    return await next()
  })

  app.on('error', err => console.error(err))

  app.use(morgan(config.logType))

}
