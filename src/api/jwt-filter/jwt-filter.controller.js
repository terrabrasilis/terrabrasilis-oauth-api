'use strict'

import { Utils } from '../utils';


export async function index (ctx, next) 
{
  if(canPassThrough(ctx)==false)
  {
    let token = Utils.getAuthorizationTokenFromHeaders(ctx.request.headers);

    const jwt = require('jsonwebtoken');
  
    // const tokenData = jwt.decode(token);
  
    var fs = require('fs');
  
    //var cert = fs.readFileSync('/dados/workspace-terrabrasilis/JWT_PUBLIC_SECRET');
    var cert = ctx.config.jwtPublicKey;
  
    let tokenValid = false;
    let errorMsg = "";
    let jwtPayload = null;
  
    await jwt.verify(token, cert, { algorithms: ['RS256'] }, function(err, decoded) {
            if (err) 
            {
              errorMsg=err;
              tokenValid = false;
            }
            else
            {
              jwtPayload = decoded;
              tokenValid = true;
            }
    });
  
    if(tokenValid==false)
    {
      ctx.status = 401
      ctx.body = { msg: "Invalid token", error: errorMsg };
      return
    }
    else
    {
      ctx.state.user = jwtPayload;
    }
  } 
  
  
  await next()
}

export function canPassThrough(ctx) 
{
  let filterPassThrough = ctx.config.filterPassThrough;  

  for (let i = 0; i < filterPassThrough.length; i++) {
    if(ctx.url.includes(filterPassThrough[i])==true)
    {
        return true
    }       
  }

  return false;  
}

