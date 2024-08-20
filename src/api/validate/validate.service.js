
const Service = {
  /**
   * Validate token values to checks if the token is still valid for the expiration date and if compatible with the requested resource
   * @param {*} expiration Time from Python in Seconds
   */
  validate(jwtUser, clientId, requestedRole) {

    var user={
      expirationDate : null,
      issuedAtDate : null,
      jwt : jwtUser,      
      authenticated : false,
      requestedResourceRole: requestedRole,
      error: ""
    }

    if(jwtUser)
    {
      user.expirationDate = new Date(jwtUser.exp * 1000);
      user.issuedAtDate = new Date(jwtUser.iat * 1000);
      user.id = jwtUser.user_id;

      // user.clientRoles = jwtUser.access[0].name;
      // user.authenticated = false;
      // user.token = '';
      
      var currentDate = new Date();

      //Comparation in milliseconds
      if (currentDate.getTime() < user.expirationDate.getTime()) {
        if (this.validateUserPermissionToAction(user, clientId, requestedRole)) {
          user.authenticated = true;
        }
        else {
          user.error = "The requested resource is not available for this authentication session.";
        }
      }
      else {
        user.error = "The requested authentication session has expired.";
      }
    }
    
    return user;

  },
/**
 * Get from the oauth server the permited scope for user and validate the request resource
 * @param {*} user 
 */
  validateUserPermissionToAction(user, clientId, requestedRole)
  {
    if(user.jwt.resource_access[clientId] && user.jwt.resource_access[clientId].roles)
    {
      let foundRequestedRole = false;
      user.jwt.resource_access[clientId].roles.forEach(role => {
        if(requestedRole==role)
        {
          foundRequestedRole = true;
        }
      });
      return foundRequestedRole;
    }
    return false;
  },
/**
 * Function to be used as Authentication Validation Log
 * @param {*} user JWT User class
 */
  logAccess(user)
  {
    let userId = "";
    let userLogin = "";
    let userEmail = "";
    let userName = "";
    let clientId = "";
    let resourceAccess = "";

    if(user.jwt)
    {
      userId = user.jwt.sub;
      userLogin = user.jwt.preferred_username;
      userName = user.jwt.name;
      userEmail = user.jwt.email;;
      clientId = user.jwt.azp;;
      resourceAccess = user.jwt.resource_access;;
    }


    console.log("--- User validation ---");
    console.log("{");
    console.log(" User id: " + userId);
    console.log(" User login: " + userLogin);
    console.log(" User name: " + userName);
    console.log(" User email: " + userEmail);
    console.log(" Client Id: " + clientId);
    console.log(" Expiration Issued At: " + user.issuedAtDate);
    console.log(" Expiration Date: " + user.expirationDate);
    console.log(" Resource Access Roles: " + JSON.stringify(resourceAccess));
    console.log(" Authenticated: " + user.authenticated);
    console.log(" Error message: " + user.error);
    console.log(" Requested Resource Role: " + user.requestedResourceRole);
    console.log("}");

  }

}

export default Service
