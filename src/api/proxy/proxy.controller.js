'use strict'
import { forEach, get } from 'lodash'
import ValidateService from '../validate/validate.service'

const dotenv = require('dotenv');
const path = require('path');

export async function index (ctx, next) 
{  

  let user = validateUser(ctx);

  if(user && user.authenticated)
  {
    let url = get(ctx.query, 'url')
  
    console.log(url);
  
    if(!url)
    {
     next();
    }
    else
    {
  
      let proxyConfig = getProxyConfig(ctx, url); 
  
      if(proxyConfig)
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
      else
      {
        next();
      }  
    }  
  }
  else
  {
    ctx.status=401;
    ctx.body = { error: "User not authenticated."};      
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
function validateUser(ctx)
{
  var user = null;

  if(ctx.state)
  {
    const jwtUser = ctx.state.user;
  
    user = ValidateService.validate(jwtUser, "");  
    
  }
  return user;
  
}


