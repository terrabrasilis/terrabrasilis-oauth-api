import { Utils } from '../utils'
import path from 'path'

import moment from 'moment'
moment.locale('pt-BR')
const extname = path.extname

const Controller = {

  index (ctx, next) {

    ctx.set('Content-disposition', 'inline; filename=terrabrasilis-oauth-api.js' );
    ctx.set('Content-Type', 'text/javascript;charset=UTF-8' );
    const filePath = __dirname+'/../../js/terrabrasilis-oauth-api.js';
    ctx.type = extname(filePath);
    ctx.body = Utils.getFileStream(filePath);
  }
  
}

module.exports = Controller
