import path from 'path'
import {Utils} from '../api/utils'

const config = {
  secret: Utils.readDockerSecret(process.env.JWT_SECRET) || 'jwt_secret',
  env: process.env.NODE_ENV || 'dev',
  health: path.normalize(__dirname + '../../'),
  ip: process.env.IP || '0.0.0.0',
  port: process.env.PORT || 9000,
  logType: process.env.LOGTYPE || 'dev'
}

module.exports = config
