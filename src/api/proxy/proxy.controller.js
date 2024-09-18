'use strict'
import { get } from 'lodash';
import ValidateService from '../validate/validate.service';

const dotenv = require('dotenv');
const path = require('path');

export async function index (ctx, next) 
{  
  let role = get(ctx.query, 'role');
  let clientId = get(ctx.query, 'client_id');

  if(!role || !clientId)
  {
    ctx.status=401;
    ctx.body = { error: "Missing resource role or client id."};       
    next()
  }
  else
  {
    let user = validateUser(ctx, clientId, role);  
    //user.authenticated = true;  
  
    if(user && user.authenticated)
    {
      if(!ctx.querystring || !ctx.querystring.includes("url="))
      {
        ctx.status=401;
        ctx.body = { error: "Missing url on querystring."};           
        next();
      }
      else
      {
        let url = ctx.querystring.split("url=")[1];
  
        if(url.includes("?")==false)
        {
          url=url.replace(/&/, '?');
        }
        url=replaceLocalhost(url);
  
        let proxyConfig = getProxyConfig(ctx, url); 
    
        if(proxyConfig)
        {
          let allowedRole = true;
          if(proxyConfig.allowed_client_id && proxyConfig.allowed_role)
          {
            //Check if has a restricted client_id and role
            if(proxyConfig.allowed_client_id!=clientId || proxyConfig.allowed_role!=role)
            {
              allowedRole = false;
              ctx.status=401;
              ctx.body = { error: "URL not authorized for the requested role."};       
            }
          }

          if(allowedRole)
          {
            let credentials = null;
            if(proxyConfig.user && proxyConfig.password)
            {
              credentials = Buffer.from(proxyConfig.user + ':' + proxyConfig.password).toString('base64');
            }
      
            await getData(url, credentials).then((response)=>
            {
              ctx.status = 200;
              var fs = require('fs');
              //ctx.body= fs.createReadStream('/tmp/test.png');
              ctx.body = response.data.read();
              ctx.res.setHeader("Content-Type", response.contentType);
            }).catch((data)=>
            {
              ctx.status = 500;
              ctx.body = data;      
            })  
          }
        }
        else
        {
          ctx.status=401;
          ctx.body = { error: "Requested URL not allowed."};     
          next();
        }  
      }  
    }
    else
    {
      ctx.status=401;
      ctx.body = { error: "User not authenticated."};      
      next();
    }
  }
  
}
function getProxyConfig(ctx, url)
{
  var ProxyConfig = require('./proxy.config');
  let config = ProxyConfig.getConfiguration(ctx);

  if(!url)
  {
    ctx.status = 500
    ctx.body = { error: 'Missing URL parameter.' };  
    return null;  
  }
  if(!config)
  {
    ctx.status = 500
    ctx.body = { error: 'Missing proxy config environment variable. (PROXY_CONFIG_FILE environment variable).' };
    return null;  
  }  
  if(!config.proxy || config.proxy.length==0)
  {
    ctx.status = 500
    ctx.body = { error: 'Missing proxy config domain. (PROXY_CONFIG_FILE environment variable).' };
    return null;  
  }
  for (let i = 0; i < config.proxy.length; i++) 
  {
    
    const proxyCfg = config.proxy[i];

    if(!proxyCfg.host)
    {
      console.log("Invalid proxy config file, missing host attribute. (PROXY_CONFIG_FILE environment variable). ")
      continue;
    }

    if(url.includes(proxyCfg.host))
    { 
      return proxyCfg;
    }
  } 
  ctx.status = 500
  ctx.body = { error: 'Domain not allowed.' };
  return false;
}
async function getData(url, credentials)
{
  return new Promise((resolve, reject) =>   
  {
    let driver = null;
    
    if(url.includes("https"))
    {
      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
      driver = require('https');
    }
    else
    {
      driver = require('http');
    }        

    let headers = {}
    if(credentials)
    {
      headers= {
        'Authorization': "Basic " + credentials
      }
    }

    const options = {
      headers: headers
    }

    const Stream = require('stream').Transform
    
    driver.get(url, options, async (resp) => 
    {

      let responseData = {
        contentType: null,
        data:  null
      };

      responseData.data = new Stream();
      
      resp.on('data', (chunk) => 
      {
        responseData.data.push(chunk);       
      });
    
      resp.on('end', () => {        
        //var fs = require('fs');
        //fs.writeFileSync("/tmp/test.png", responseData.data.read())
  
        responseData.contentType = resp.headers['content-type'];

        responseData.data.end();

        resolve(responseData);        
      });    

    }).on("error", (err) => {
      console.log("Error: " + err.message);   
      let responseData = {
        contentType: null,
        data:  null
      };   
      responseData.data = err;
      responseData.contentType = "plain/text";
      reject(err);
    });
      
    });

}
function validateUser(ctx, clientId, role)
{
  var user = null;

  if(ctx.state)
  {
    const jwtUser = ctx.state.user;
  
    user = ValidateService.validate(jwtUser, clientId, role);  
    
  }
  return user;
  
}

function replaceLocalhost(url)
{
  if(url.includes("http://localhost"))
  {
    return url.replace("http://localhost", "https://terrabrasilis.dpi.inpe.br");
  }
  return url;
}


