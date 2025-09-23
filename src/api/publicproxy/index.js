'use strict'

import router from 'koa-router'
import { index } from './publicproxy.controller'

const publicproxy = router()

publicproxy.get('/', index)

export default publicproxy
