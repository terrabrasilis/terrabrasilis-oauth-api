import router from 'koa-router'
import { index } from './validate.controller'

const validate = router()

validate.get('/:client_id/:role', index)
validate.post('/:client_id/:role', index)

export default validate
