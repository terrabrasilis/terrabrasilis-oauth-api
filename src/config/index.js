import path from 'path'
import {Utils} from '../api/utils'

const config = {
  secret: Utils.readDockerSecret(process.env.JWT_SECRET) || 'secret',
  env: process.env.NODE_ENV || 'dev',
  health: path.normalize(__dirname + '../../'),
  ip: process.env.IP || '0.0.0.0',
  port: process.env.PORT || 9002,
  logType: process.env.LOGTYPE || 'dev',
  proxyConfigFile: process.env.PROXY_CONFIG_FILE,
  debug: false
}

module.exports = config
