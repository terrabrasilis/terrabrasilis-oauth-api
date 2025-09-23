const path = require('path');

const OAuthConfig = {

  config: null,

  getConfiguration(ctx) 
  {
    if(!this.config)
    {
      try
      {
        const configFile = path.resolve(__dirname, ctx.config.oauthConfigFile);

        var fs = require('fs');
        this.config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      }
      catch(ex)
      {
        console.log("Error: " + ex.message);  
        ctx.status = 500
        ctx.body = { error: 'Invalid oauth config file. (OAUTH_CONFIG_FILE environment variable). Exception: ' + ex };
        return null;
      }

    }
    return this.config;
  }
}

export default OAuthConfig