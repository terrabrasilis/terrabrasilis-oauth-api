import { get } from 'lodash'
import { constants, Utils } from '../utils'
import path from 'path'

import moment from 'moment'
import Service from './validate.service'
moment.locale('pt-BR')
const extname = path.extname

const Controller = {

  index (ctx, next) {
    
    var resource = get(ctx, 'params.resource');
    
    const jwtUser = ctx.state.user;
    var isAuthenticated = false;
    
    if(jwtUser) 
    {
      isAuthenticated = true;
    } 

    var user = Service.validate(jwtUser, resource);

    Service.logAccess(user);

    ctx.set('Content-disposition', 'inline');
    ctx.set('Content-Type', ' application/json; charset=utf-8');
    ctx.body = JSON.stringify(user);
  } 

}

module.exports = Controller
