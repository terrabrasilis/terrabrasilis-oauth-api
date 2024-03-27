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

    const config = ctx.config;
    
    var user = Service.validate(jwtUser, resource);

    Service.logAccess(user);
    
    ctx.set('Content-disposition', 'inline');
    ctx.set('Content-Type', ' application/json; charset=utf-8');
    ctx.body = JSON.stringify(user);
  

    if(config && config.debug)
    {
      Controller.testToken(ctx, jwtUser);
    }

    if(!jwtUser)
    {            
      ctx.status=401;
      ctx.body = { error: "Invalid session token.", exception: ctx.state.jwtOriginalError};   
    }
    
  },

  testToken(ctx, jwtUser)
  {
      /*
          For debugging purpose
      */
          const jwt = require('jsonwebtoken');
          console.log("JWT User: " + jwtUser);
    
          console.log("Authorization Header: " + ctx.request.headers.authorization); 
    
          console.log("Headers: " + JSON.stringify(ctx.request.headers) ); 
    
          let token = ctx.request.headers.authorization.split(" ")[1];

          try
          {
            jwt.verify(token, ctx.config.secret, function(err, decoded) {
              if (err) 
              {
                console.log(err);              
              }
              else
              {
                console.log(decoded);                            
              }
            });
          }
          catch(ex)
          {
            console.log(ex);                            
          }
  }

}

module.exports = Controller
