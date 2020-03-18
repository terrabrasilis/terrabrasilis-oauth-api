import { Utils } from '../utils'
import path from 'path'

import moment from 'moment'
moment.locale('pt-BR')
const extname = path.extname

const Controller = {

  index (ctx, next) {

    ctx.set('Content-disposition', 'inline; filename=terrabrasilis-oauth-api.js' );
    ctx.set('Content-Type', 'text/javascript;charset=UTF-8' );
    const filePath = __dirname+'/../../../assets/js/terrabrasilis-oauth-api.js';
    ctx.type = extname(filePath);
   
    var fs = require('fs');
 
    let contents = fs.readFileSync(filePath);

    //Adding requested address to be used as reference to load assets
    var fullUrl = ctx.href;
    fullUrl = fullUrl.replace('getoauthjs','');
    contents +=  "\n Authentication.serverURL='" + fullUrl+"';";
    ctx.body = contents;
  }
  
}

module.exports = Controller
