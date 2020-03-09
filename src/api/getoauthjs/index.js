import { index } from './getoauthjs.controller'
import router from 'koa-router'

const getoauthjs = router()

getoauthjs.get('/', index)

export default getoauthjs
