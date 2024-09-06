'use strict'
import { get } from 'lodash';

const dotenv = require('dotenv');
const path = require('path');

export async function index (ctx, next) 
{  

  let url = get(ctx.query, 'url')

  if(!url)
  {
    next();
  }
  else
  { 

    url = ctx.querystring.replace("url=", "");

    url = unEscape(url);

    if(url.includes("?")==false)
    {
      url=url.replace(/&/, '?');
    }
    url=replaceLocalhost(url);

    

    var GetCapabilitiesConfig = require('./getcapabilities.config');
    let config = GetCapabilitiesConfig.getConfiguration(ctx);
    
    let requestOk = false;
    let responseOk = false;

    if(checkRequest(ctx, url, config))
    {
      requestOk = true;

      await getData(url).then((response)=>
      {      

        if(checkResponse(ctx, response, config))
        {
          responseOk = true;
          ctx.status = 200;
          ctx.body = response.data.read();
          ctx.res.setHeader("Content-Type", response.contentType);

          logRequest(url, requestOk, responseOk, response.contentType);
        }
        else
        {
          logRequest(url, requestOk, responseOk, response.contentType);
          next();
        }
      }).catch((data)=>
      {
        logRequest(url, requestOk, responseOk, "");
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
function logRequest(url, requestOk, responseOk, contentType)
{
  console.log("GetCapabilities request to: " + url + " - Request Allowed: " + requestOk +  " - Response Allowed: " + responseOk + " - Response ContentType: " + contentType);
}
function checkRequest(ctx, url, config)
{

  for (let i = 0; i < config.getcapabilities.allowed_querystring_token_whitelist.length; i++) 
  {
    const token = config.getcapabilities.allowed_querystring_token_whitelist[i];

    if(url.toLowerCase().includes(token.toLowerCase()))
    {
      return true;
    }    
    
  }
    
  ctx.status = 406
  ctx.body = { error: 'URL not allowed.' };
  return false;

}
function checkResponse(ctx, response, config)
{
  for (let i = 0; i < config.getcapabilities.allowed_response_types.length; i++) 
  {
    const contentType = config.getcapabilities.allowed_response_types[i];
    if(response.contentType && response.contentType.toLowerCase().includes(contentType.toLowerCase()))
    {
      return true;
    }
  }
    
  ctx.status = 406
  ctx.body = { error: 'Response Content Type not allowed.' };
  return false;
}
async function getData(url)
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


    const options = {
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
function replaceLocalhost(url)
{
  if(url.includes("http://localhost"))
  {
    return url.replace("http://localhost", "https://terrabrasilis.dpi.inpe.br");
  }
  return url;
}
function unEscape(url)
{
  let unescaped_url = decodeURIComponent(url)
  if (unescaped_url.length < url.length)
  {
    return unescaped_url;
  }
  else{
    return url;
  }      
}
