'use strict'

import { index } from './proxy.controller'
import router from 'koa-router'

const proxy = router()

proxy.get('/', index)

export default proxy
