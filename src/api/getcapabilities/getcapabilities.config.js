const dotenv = require('dotenv');
const path = require('path');

const GetCapabilitiesConfig = {

  getCapabilitiesConfig: null,

  getConfiguration(ctx) 
  {
    if(!this.getCapabilitiesConfig)
    {
      try
      {
        const getCapabilitiesConfigFile = path.resolve(__dirname, ctx.config.getCapabilitiesConfigFile);

        var fs = require('fs');
        this.getCapabilitiesConfig = JSON.parse(fs.readFileSync(getCapabilitiesConfigFile, 'utf8'));

        if(!this.getCapabilitiesConfig)
        {
          ctx.status = 500
          ctx.body = { error: 'Missing getCapabilities config environment variable. (GET_CAPABILITIES_CONFIG_FILE environment variable).' };
          return null;  
        }  
        if(!this.getCapabilitiesConfig.getcapabilities)
        {
          ctx.status = 500
          ctx.body = { error: 'Missing getCapabilities config.' };
          return null;  
        }
        if(!this.getCapabilitiesConfig.getcapabilities.allowed_querystring_token_whitelist && !Array.isArray(config.getcapabilities.allowed_querystring_token_whitelist))
        {
          ctx.status = 500
          ctx.body = { error: 'Missing allowed querystring token whitelist (Array).' };
          return null;  
        }
        if(!this.getCapabilitiesConfig.getcapabilities.allowed_response_types && !Array.isArray(config.getcapabilities.allowed_response_types))
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
        ctx.body = { error: 'Invalid getCapabilities config file. (GET_CAPABILITIES_CONFIG_FILE environment variable). Exception: ' + ex };
        return null;
      }

    }
    return this.getCapabilitiesConfig;
  }
}

export default GetCapabilitiesConfig
