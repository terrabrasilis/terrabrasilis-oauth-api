import { index } from './validate.controller'
import router from 'koa-router'

const validate = router()

validate.get('/:resource', index)

export default validate
