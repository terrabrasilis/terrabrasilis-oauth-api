import path from 'path'
import { Utils } from '../api/utils'

const config = {
  jwtPublicKey: Utils.readDockerSecret(process.env.JWT_PUBLIC_KEY) || 'public',
  env: process.env.NODE_ENV || 'dev',
  health: path.normalize(__dirname + '../../'),
  ip: process.env.IP || '0.0.0.0',
  port: process.env.PORT || 9002,
  logType: process.env.LOGTYPE || 'dev',
  oauthConfigFile: process.env.OAUTH_CONFIG_FILE,
  proxyConfigFile: process.env.PROXY_CONFIG_FILE,
  filterPassThrough: ["/assets", "/getoauthjs", "/health"],
  debug: false
}

module.exports = config
