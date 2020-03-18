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

    var packageJSON = require(__dirname+'/../../../package.json');
    
    //Adding requested address to be used as reference to load assets
   
   
    var fullUrl = "";
    // This attribute url is pushed on the header when the nginx proxy redirects from terrabrasilis.dpi.inpe.br to internal docker.
    // This isn't the best solution, but for now it is ok. The following condition is to check if the parameter exists, if true the request is coming from proxy, if false it's coming directly.
    // TODO: Find a way to remove this condition and use the same way to get the URL (issue on the proxy)
    if(ctx.req.headers.url)
    {
      fullUrl = ctx.origin + ctx.req.headers.url;
    }
    else
    {
      fullUrl = ctx.href;
    }
    
    fullUrl = fullUrl.replace('getoauthjs','');

    contents +=  "\n Authentication.serverURL='" + fullUrl+"';";
    contents +=  "\n Authentication.version='" + packageJSON.version+"';";
    
    ctx.body = contents;
  }
  
}

module.exports = Controller
