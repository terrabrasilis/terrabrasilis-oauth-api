'use strict'

import { Utils } from '../utils';

export async function index (ctx, next) {

  
  let token = Utils.getAuthorizationTokenFromHeaders(ctx.request.headers);

  const jwt = require('jsonwebtoken');
  
  

  let tokenValid = false;

  if(token)
  {
    await jwt.verify(token, ctx.config.jwtPublicKey, { algorithm: 'RS256'}, function(err, decoded) 
    { 
      if (err) 
      {
        console.log(err);              
        tokenValid = false;
      }
      else
      {
        tokenValid = true;
        console.log(decoded);                            
      }
      
    });
  }  

  if(tokenValid==false)
  {
    ctx.status = 401
    ctx.body = { msg: "Invalid token" };
    return
  }    
  
  await next()
}
