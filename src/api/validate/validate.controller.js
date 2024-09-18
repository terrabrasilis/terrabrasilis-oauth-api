import { get } from 'lodash'
import path from 'path'

import moment from 'moment'
import Service from './validate.service'

moment.locale('pt-BR')
const extname = path.extname

const Controller = {

  index (ctx, next) {
    
    var role = get(ctx, 'params.role');
    var clientId = get(ctx, 'params.client_id');
    
    if(!clientId)
    {
      ctx.status=401;
      ctx.body = { error: "Missing clientId configuration."};   
    }
    
    const jwtUser = ctx.state.user;
    
    var user = Service.validate(jwtUser, clientId, role);

    Service.logAccess(user);
    
    ctx.set('Content-disposition', 'inline');
    ctx.set('Content-Type', ' application/json; charset=utf-8');
    ctx.body = JSON.stringify(user);
  
    if(!jwtUser)
    {            
      ctx.status=401;
      ctx.body = { error: "Invalid session token.", exception: ctx.state.jwtOriginalError};   
    }    
  }
  
}

module.exports = Controller
