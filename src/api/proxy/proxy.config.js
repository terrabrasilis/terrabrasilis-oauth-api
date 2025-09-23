const dotenv = require('dotenv');
const path = require('path');

const ProxyConfig = {

  proxyConfig: null,

  getConfiguration(ctx) 
  {
    if(!this.proxyConfig)
    {
      try
      {
        const proxyConfigFile = path.resolve(__dirname, ctx.config.proxyConfigFile);

        var fs = require('fs');
        this.proxyConfig = JSON.parse(fs.readFileSync(proxyConfigFile, 'utf8'));
      }
      catch(ex)
      {
        console.log("Error: " + ex.message);  
        ctx.status = 500
        ctx.body = { error: 'Invalid proxy config file. (PROXY_CONFIG_FILE environment variable). Exception: ' + ex };
        return null;
      }

    }
    return this.proxyConfig;
  }
}

export default ProxyConfig
