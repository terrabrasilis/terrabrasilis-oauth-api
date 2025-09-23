'use strict'

import Koa from 'koa'
import config from './config'
import configFilters from './config/filters'
import configKoa from './config/koa'
import configRoutes from './config/routes'

const app = new Koa()
app.port = config.port

configKoa(app)
configFilters(app)
configRoutes(app)

export default app
