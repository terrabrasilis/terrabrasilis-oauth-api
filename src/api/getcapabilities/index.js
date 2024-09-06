'use strict'

import router from 'koa-router'
import { index } from './getcapabilities.controller'

const getcapabilities = router()

getcapabilities.get('/', index)

export default getcapabilities
