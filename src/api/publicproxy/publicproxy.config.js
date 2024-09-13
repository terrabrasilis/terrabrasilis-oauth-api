const dotenv = require('dotenv');
const path = require('path');

const PublicProxyConfig = {

  publicProxyConfig: null,

  getConfiguration(ctx) 
  {
    if(!this.publicProxyConfig)
    {
      try
      {
        const publicProxyConfigFile = path.resolve(__dirname, ctx.config.publicProxyConfigFile);

        var fs = require('fs');
        this.publicProxyConfig = JSON.parse(fs.readFileSync(publicProxyConfigFile, 'utf8'));

        if(!this.publicProxyConfig)
        {
          ctx.status = 500
          ctx.body = { error: 'Missing public proxy config environment variable. (PUBLIC_PROXY_CONFIG_FILE environment variable).' };
          return null;  
        }  
        if(!this.publicProxyConfig.publicproxy)
        {
          ctx.status = 500
          ctx.body = { error: 'Missing publicproxy element config' };
          return null;  
        }
        if(!this.publicProxyConfig.publicproxy.allowed_querystring_token_whitelist && !Array.isArray(config.publicproxy.allowed_querystring_token_whitelist))
        {
          ctx.status = 500
          ctx.body = { error: 'Missing allowed querystring token whitelist (Array).' };
          return null;  
        }
        if(!this.publicProxyConfig.publicproxy.allowed_response_types && !Array.isArray(config.publicproxy.allowed_response_types))
        {
          ctx.status = 500
          ctx.body = { error: 'Missing allowed response types (Array).' };
          return null;  
        }   
      }
      catch(ex)
      {
        console.log("Error: " + ex.message);  
        ctx.status = 500
        ctx.body = { error: 'Invalid public proxy file. (PUBLIC_PROXY_CONFIG_FILE environment variable). Exception: ' + ex };
        return null;
      }

    }
    return this.publicProxyConfig;
  }
}

export default PublicProxyConfig
