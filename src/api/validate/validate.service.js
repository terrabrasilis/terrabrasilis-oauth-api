
const Service = {
  /**
   * Validate token values to checks if the token is still valid for the expiration date and if compatible with the requested resource
   * @param {*} expiration Time from Python in Seconds
   */
  validate(jwtUser, resource) {
    var user={
      expirationDate : new Date(jwtUser.exp * 1000),
      issuedAtDate : new Date(jwtUser.iat * 1000),
      id : jwtUser.user_id,
      requestedResource : resource,
      accessType : jwtUser.access[0].type,
      accessName : jwtUser.access[0].name,
      accessAction : jwtUser.access[0].actions[0],
      error : "",
      authenticated : false
    }

    var currentDate = new Date();

    //Comparation in milliseconds
    if (currentDate.getTime() < user.expirationDate.getTime()) {
      if(this.validateUserPermissionToAction(user))
      {
        user.authenticated = true;
      }
      else
      {
        user.error = "The requested resource is not available for this authentication session.";
      }
    }
    else {
      user.error = "The requested authentication session has expired.";
    }

    return user;

  },
/**
 * Get from the oauth server the permited scope for user and validate the request resource
 * @param {*} user 
 */
  validateUserPermissionToAction(user)
  {
    /*
     TODO: we don't need to validade permission on this group of application yet. If the user is authenticated (not expired) it's permited.
    */
    return true;
  },
/**
 * Function to be used as Authentication Validation Log
 * @param {*} user JWT User class
 */
  logAccess(user)
  {
    console.log("--- User validation ---");
    console.log("{");
    console.log(" User id: " + user.id);
    console.log(" Access name: " + user.accessName);
    console.log(" Access type: " + user.accessType);
    console.log(" Expiration: " + user.expirationDate);
    console.log(" Expiration Issued At: " + user.issuedAtDate);
    console.log(" Actions: " + user.accessAction);
    console.log(" Authenticated: " + user.authenticated);
    console.log(" Error message: " + user.error);
    console.log(" Requested Resource: " + user.resource);
    console.log("}");

  }

}

export default Service
