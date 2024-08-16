'use strict'

import router from 'koa-router'
import { index } from './jwt-filter.controller'

const jwtFilter = router()

jwtFilter.get('/*', index)

export default jwtFilter
