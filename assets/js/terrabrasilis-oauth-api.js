var Authentication = {
  oauthBaseURL: "http://oauth.dpi.inpe.br",
  oauthApiURL: "http://oauth.dpi.inpe.br/api",
  tokenKey: "oauth.obt.inpe.br",
  service: "terrabrasilis",
  scope: "portal:dash:admin",
  expiredKey: "expired_token",
  usedInfoKey: "user_info",
  usedDataKey: "user",
  loginStatusChangedCallback: null,
  terrabrasilisOauthApiURL: "http://terrabrasilis.dpi.inpe.br/oauth-api/",
  expirationGuardInterval: null,
  validationData: null,
  validationInterval: 300000,
  ul2append: "#navigationBarUL",

  init(language, loginStatusChanged)
  {
    this.loginStatusChangedCallback=loginStatusChanged;
    AuthenticationTranslation.init(language);
    this.buildLoginDropdownMenu();
    this.addLoginCss();
    this.equalizeStorageAndCookieToken();
    if(this.hasToken())
    {
      this.validateToken(this.getToken());        
    }
  },
  initCustom(language, loginStatusChanged, customUl2append)
  {
    if(customUl2append)
    {
      this.ul2append = customUl2append;
    }

    this.init(language, loginStatusChanged);
  },
  
  showAuthenticationModal() {

    //Verify if authentication modal already exists
    if($('#authentication-div').length>0)
    {
      $('#authentication-div').remove();
    }
    

    //Authentication div
    var authenticationDiv = $('<div>', {
      id: 'authentication-div',
      frameborder: 0,
      class: "modal-auth",
      tabindex: "-1",
      role: "dialog"
    });

    authenticationDiv.appendTo("body");

    //Modal div
    var modalLoginDiv = $('<div>',
      {
        id: "modal-login",
        class: "modal-auth-dialog modal-auth-dialog-centered ",
        style: "min-width: 500px;"
      });

    $('#authentication-div').append(modalLoginDiv);

    //Modal Content div

    var modalContentDiv = $('<div>',
      {
        class: "modal-auth-content box-login"
      });
    modalLoginDiv.append(modalContentDiv);

    //Modal Header Div
    
    var modalCloseButton = '<span class="close">&times;</span>';

    var modalHeaderDiv = $('<div>',
      {
        class: "modal-auth-header",
        html: modalCloseButton
      });
    modalContentDiv.append(modalHeaderDiv);

    //Modal Body Div
    var modalBodyDiv = $('<div>',
      {
        class: "modal-body",
        id: "authentication-body"
      });
    modalContentDiv.append(modalBodyDiv);


    //Box login form logo Div
    var modalBoxLoginFormLogo = $('<div>',
      {
        class: "box-login-form-logo"
      });
    modalBoxLoginFormLogo.append('<img src="'+Authentication.serverURL+'images/logo-terrabrasilis.png" alt="logo">');
      
    modalBodyDiv.append(modalBoxLoginFormLogo); 
    
    modalBodyDiv.append('<span class="box-login-form-title">TerraBrasilis</span>');

    //Modal Footer Div

    // Login box form 
    var loginBoxForm = $('<div>',
    {
      class: 'box-form'
    });
    modalBodyDiv.append(loginBoxForm);
    
   
    //Login input div
    var loginInputDiv = $('<div>',{
      class:"wrap-box-input validate-input"
    });
    loginInputDiv.attr('data-validate', AuthenticationTranslation.getTranslated('username-validation'));
    loginInputDiv.append('<i class="material-icons">person</i>');
    loginInputDiv.append('<input class="box-input" type="text" name="username" placeholder="'+AuthenticationTranslation.getTranslated('username')+'" id="username-input">');
    loginInputDiv.append('<span class="focus-box-input" data-placeholder=""></span>');

    loginBoxForm.append(loginInputDiv);

    //Login password div
    var loginPasswordDiv = $('<div>',{
      class:"wrap-box-input validate-input"
    });
    loginPasswordDiv.attr('data-validate', AuthenticationTranslation.getTranslated('password-validation'));
    loginPasswordDiv.append('<i class="material-icons">lock</i>');
    loginPasswordDiv.append('<input class="box-input" type="password" name="pass" placeholder="'+AuthenticationTranslation.getTranslated('password')+'" id="password-input">');
    loginPasswordDiv.append('<span class="focus-box-input" data-placeholder=""></span>');

  loginBoxForm.append(loginPasswordDiv);
  
    var btnContainerDiv = $('<div>',
    {
      class:"container-box-login-form-btn"
    });
		btnContainerDiv.append('<button type="button" id="login-button" onclick="Authentication.validateLogin()" class="box-login-form-btn">'+AuthenticationTranslation.getTranslated('submitLogin')+'</button>');				
    
    loginBoxForm.append(btnContainerDiv);

    var loginFormAlert = $('<div>',
    {
      class: 'alert alert-danger alert-dismissible show align-middle justify-content-center',
      role: 'alert',
      id:'loginAlert'
    });
    loginFormAlert.hide();
    modalBodyDiv.append(loginFormAlert);

    $(function(){
      //Login when pressing enter
      $('#password-input').keypress(function(e){
        if(e.which == 13) {
          $('#login-button').click(); 
        }
      })
    });
    this.showAuhenticationDiv(true);
    //$('#authentication-div').modal('show');


  },
  showWarningDiv(show)
  {
    if(show==true)
    {
      var authenticationDiv = $("#modal-container-warning");
      authenticationDiv.css("display","block");
    }
    else
    {
      var authenticationDiv = $("#modal-container-warning");
      authenticationDiv.css("display","none");
    }

  },
  showAuhenticationDiv(show)
  {
    if(show==true)
    {
      var authenticationDiv = $("#authentication-div");
      authenticationDiv.css("display","block");
      
      $('body').css("overflow-y", "hidden");
      
      $(".close").on("click",function()
      {
        Authentication.showAuhenticationDiv(false);
      });

    }
    else
    {

      $('body').css("overflow-y", "");

      var authenticationDiv = $("#authentication-div");
      authenticationDiv.css("display","none");
    }
    


  },
  validateLogin()
  {
    let user = $('#username-input').val();
    let pass = $('#password-input').val();

    if (user==="" || pass==="")
    {
      Authentication.handleError(AuthenticationTranslation.getTranslated('missing-user-pass'));
    }
    else
    {
      Authentication.login(user, pass);
    }
  },
  validateToken(userToken)
  {
    $.ajax(this.terrabrasilisOauthApiURL + "/validate/" + this.service, {
      type: "GET",
      dataType: 'json',
      headers: {
        "Authorization": "Bearer " + userToken
      },
      contentType: "application/json",
    }).done(function (data) {
      console.log("User authentication token is valid");
      Authentication.validationData = data;
      Authentication.configureExpirationGuard();
    }).fail(function (xhr, status, error) {
      console.log("User authentication token is invalid, logging out...");
      Authentication.logout();
    });
  },
  handleError(message)
  {
    $('#loginAlert').html(message);
    $("#loginAlert").fadeTo(2000, 500).slideUp(500, function() {
      $("#loginAlert").slideUp(500);
    });
  },
  login(user, pass) {
    $.ajax(this.oauthApiURL + "/oauth/auth/login", {
      type: "POST",
      dataType: 'json',
      data: '{ "username": "' + user + '","password": "' + pass + '" }',
      contentType: "application/json",
    }).done(function (data) {
      Authentication.setUserData(JSON.stringify(data));
      Authentication.loadAppToken(data.access_token);
      
    }).fail(function (xhr, status, error) {
      console.log("Could not reach the API to authenticate the user: " + error);
      Authentication.handleError(AuthenticationTranslation.getTranslated('authenticationFailed'));
    });
  },
  loadUserInfo(userId, userToken) {
    $.ajax(this.oauthApiURL + "/oauth/users/" + userId, {
      type: "GET",
      dataType: 'json',
      headers: {
        "Authorization": "Bearer " + userToken
      },
      contentType: "application/json",
    }).done(function (data) {
      Authentication.setUserInfo(JSON.stringify(data));
      //$('#authentication-div').modal('hide');
      Authentication.showAuhenticationDiv(false);
      Authentication.buildLoginDropdownMenu();
      Authentication.removeExpiredToken();
    }).fail(function (xhr, status, error) {
      console.log("Could not reach the API to obtain the user info: " + error);
      Authentication.logout();
    });
  },
  loadAppToken(userToken) {
    $.ajax(this.oauthApiURL + "/oauth/auth/token?service=" + this.service + "&scope=" + this.scope, {
      type: "GET",
      dataType: 'json',
      headers: {
        "Authorization": "Bearer " + userToken
      },
      contentType: "application/json",
    }).done(function (data) {
      var myToken = data.access_token;
      Authentication.setToken(myToken);
      Authentication.loadUserInfo(data.user_id, userToken);
      Authentication.validateToken(myToken);
      Authentication.loginStatusChanged();

      return true;
    }).fail(function (xhr, status, error) {
      console.log("Could not reach the API to obtain App Token: " + error);
//      $('#modal-container-warning').modal('show');
      this.showWarningDiv(true);
      return false;
    });
  },

  dropUser() {
    if(confirm(AuthenticationTranslation.getTranslated('drop-user-confirm'))) {
      let dataUser=Authentication.getUserData();
      $.ajax(this.oauthApiURL + "/oauth/users/" + dataUser.user_id, {
        type: "DELETE",
        dataType: 'json',
        headers: {
          "Authorization": "Bearer " + dataUser.access_token
        },
        contentType: "application/json",
      }).done(function (data) {
        Authentication.logout();
        alert(AuthenticationTranslation.getTranslated('drop-user-ok'));
      }).fail(function (xhr, status, error) {
        console.log("Could not reach the API to delete the user: " + error);
        Authentication.logout();
        alert(AuthenticationTranslation.getTranslated('drop-user-fail'));
      });
    }
  },

  setToken(value) {
    this.setKey(this.tokenKey, value);
    this.setCookie(this.tokenKey, value, 1);
  },
  /**
   * Set a new value for the specified key.
   * To remove one key, set the value with null or undefined
   * 
   * @param {string} key The name of key
   * @param {any} value The value of key
   */
  setKey(key, value) {
    if (localStorage) {
      if (value === undefined || value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } else {
      console.log("Sorry! No Web Storage support..");
    }
  },
  setUserInfo(value) {
    this.setKey(this.usedInfoKey, value);
  },
  setUserData(value){
    this.setKey(this.usedDataKey, value);
  },
  getUserData(){
    return JSON.parse(this.getValueByKey(this.usedDataKey));
  },
  removeUserData(){
    this.setKey(this.usedDataKey, null);
  },
  logout() {
    this.removeToken();
    this.removeUserInfo();
    this.removeUserData();
    this.removeExpiredToken();
    this.buildLoginDropdownMenu();
    this.loginStatusChanged();
    this.eraseCookie(this.tokenKey);
    
    if(this.expirationGuardInterval!=null)
    {
      clearInterval(this.expirationGuardInterval);
      this.expirationGuardInterval=null;
    }
    this.validationData=null;
    
  },
  removeUserInfo() {
    this.setKey(this.usedInfoKey, null);
  },
  removeToken() {
    this.setKey(this.tokenKey, null);
  },
  removeExpiredToken() {
    this.setKey(this.expiredKey, null);
  },
  isExpiredToken() {
    return this.getValueByKey(this.expiredKey)==="true";
  },
  
  /**
   * Functions attach the login navigation item to a default toolbar (Also checks if the user is logged in and build the login dropdown menu)
   */
  buildLoginDropdownMenu() {

    //Verifiy if login LI already exists
    let li = $('#login-li');
    if (li && li.length > 0) {
      li.empty();
    }
    else {
      li = $('<li>',
        {
          class: "nav-item dropdown-auth",
          id: "login-li"
        });
    }

    let a = $('<a/>',
      {
        class: "nav-link dropdown-toggle",
        id: "navbarDropdownLoginLink",
        role: "button"

      });
    a.attr("aria-expanded", "true");
    a.attr("aria-haspopup", "true");
    a.attr("data-toggle", "dropdown");
    a.attr("href", "#");

    let userImageUrl = '';
    if (this.hasToken()) 
    {
      userImageUrl = Authentication.serverURL+'images/user-logado.png';
    }
    else
    {
      userImageUrl = Authentication.serverURL+'images/user-deslogado.png';
    }

    //Adding image logged or unlogged
    let imagetag = '<img id="login"  style="width:28px; height:28px; border-radius:50%" alt="Login" src="'+userImageUrl+'" title="Autentique">';
    a.append('<i class="material-icons iconmobile">assignment </i><span id="maps-sup">'+imagetag+'</span>');
    a.appendTo(li);
  

    let dropDownDiv = $('<div/>',
      {
        id: "navbarDropdownLoginPopup",
        class: "submenu dropdown-auth-content",
        style: ""
      });
    dropDownDiv.attr("aria-labelledby", "navbarDropdownLoginLink");
    dropDownDiv.appendTo(li);
    
    if (this.hasToken()) {
      let info = this.getUserInfo();

      $('<a/>',
        {
          class: 'dropdown-auth-item',
          html: '<b style="color:#6c757d;">' + info.name + ' / ' + info.institution + '</b>'
        }).appendTo(dropDownDiv);

      let a = $('<a/>',
        {
          class: 'dropdown-auth-item',
          html: '<span >'+AuthenticationTranslation.getTranslated('change-pass')+'</span>'
        });
      a.attr("href", this.oauthBaseURL);
      a.appendTo(dropDownDiv);

      a = $('<a/>',
        {
          class: 'dropdown-auth-item',
          html: '<span >'+AuthenticationTranslation.getTranslated('drop-user')+'</span>'
        });
      a.attr("href", "javascript:Authentication.dropUser();");
      a.appendTo(dropDownDiv);

      a = $('<a/>',
        {
          class: 'dropdown-auth-item',
          html: '<span >'+AuthenticationTranslation.getTranslated('logout')+'</span>'
        });
      a.attr("href", "javascript:Authentication.logout();");
      a.appendTo(dropDownDiv);
           

    }
    else {

      let a = $('<a/>',
        {
          class: 'dropdown-auth-item',
          html: '<span >'+AuthenticationTranslation.getTranslated('login')+'</span>'
        });
      a.attr("href", "javascript:Authentication.showAuthenticationModal();");
      a.appendTo(dropDownDiv);
      a = $('<a/>',
        {
          class: 'dropdown-auth-item',
          html: '<span >'+AuthenticationTranslation.getTranslated('reset-pass')+'</span>'
        });
      a.attr("href", this.oauthBaseURL);
      a.appendTo(dropDownDiv);
    }
    //Appending to navigation menu default UL

    $(this.ul2append).append(li);
 
  },
  hasToken() {
    var token = this.getValueByKey(this.tokenKey);
    return (token && token != "");
  },
  getToken() {
    return this.getValueByKey(this.tokenKey);
  },
  getValueByKey(key) {
    var value = null;
    if (localStorage) {
      value = localStorage.getItem(key);
    } else {
      console.log("Sorry! No Web Storage support..");
    }
    return value;
  },
  getUserInfo() {
    return JSON.parse(this.getValueByKey(this.usedInfoKey));
  },
  loginStatusChanged()
  {
    if(this.loginStatusChangedCallback!=null)
    {
      this.loginStatusChangedCallback();
    }
  },
  setLoginStatusChangedCallback(callback)
  {
    this.loginStatusChangedCallback = callback;
  },
  setExpiredToken(state) {
    this.setKey(this.expiredKey,state);
  },
  addLoginCss()
  {
    $('head').append('<link rel="stylesheet" type="text/css" href="'+Authentication.serverURL+'css/login.css" />');
  },
  setCookie(name, value, days) {
    document.cookie = name + "=" + (value || "") + "; path=/";
  },
  getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  eraseCookie(name) {
    document.cookie = name + '=; path=/';

    let cookie = document.cookie;
    cookie
  },
  /**
   * This method equalizes storage token status with cookies. This is to be able to add from token to cookie if it already exists on LocalStorage
   * Now setToken always sets on Cookie also.
   * This equalization will run only when the application has inited this api and has a LocalStorage Token Key and not and Cookie Token key
   */
  equalizeStorageAndCookieToken()
  {
    if(this.hasToken())
    {
      let cookie = this.getCookie(this.tokenKey);
      if(cookie==null)
      {
        this.setToken(this.getToken());
      }
    }
    else
    {
      this.eraseCookie(this.tokenKey);
    }
    
  },
  /**
   * This functions configure an interval to check if the authentication token is still valid for the current session
   */
  configureExpirationGuard()
  {
    if(this.hasToken()
    && this.validationData
    && this.validationData.authenticated==true)
    {
      this.expirationGuardInterval = setInterval(this.expirationCheck,this.validationInterval);
    }
    else
    {
      this.logout();
    }
    
  },
  /**
   * This functions checks if the authentication token is still valid for the current session, if not it forces a logout.
   * Returns true if expired
   */
  expirationCheck()
  {
    if(Authentication.hasToken()
    && Authentication.validationData
    && Authentication.validationData.authenticated==true)
    {
      var now = new Date();
      var expiration = new Date(Authentication.validationData.expirationDate);

      if(now>expiration)
      {
        Authentication.logout();
        return true;
      }
    }
    else
    {
      Authentication.logout();
      return true;
    }
    return false;
    
  }
}


$(document).ready(function () {
 // Authentication.init();
});
/**
 * Authentication translation functions and data
 */
var AuthenticationTranslation = {
  currentLanguage: 'pt-br',
  init(lang)
  {
    this.currentLanguage = lang;
    console.log("Initializating authentication-oauth-api translation in:" + this.currentLanguage);
  },
  getTranslated(key)
  {
    return this.translationJson[this.currentLanguage][key];
  },
  translationJson:
  { 
    'pt-br':
    {
      'authenticationFailed':'O nome de usuário ou senha está incorreto. Verifique se CAPS LOCK está ativado. Se você receber essa mensagem novamente, entre em contato com o administrador do sistema para garantir que você tenha permissão para logar no portal.',
      'submitLogin':"Entrar",
      'submitCancel':"Cancelar",
      'username':"Usuário",
      'password':"Senha",
      'logout':"Sair",
      'login':"Entrar",
      'reset-pass':'Redefinir senha',
      'change-pass':'Alterar senha',
      'drop-user':'Remover conta de usuário',
      'drop-user-ok':'Conta removida.',
      'drop-user-fail':'Falhou ao remover a conta.',
      'drop-user-confirm':'A conta será removida permanentemente. Confirma?',
      'missing-user-pass':"Usuário ou senha não foram preenchidos!",
      'username-validation':"Entre com o usuário",
      'password-validation':"Entre com a senha"


    },
    'en':
    {
      'authenticationFailed':'The username or password is wrong. Verify if CAPS LOCK is enable. If you receive this message again, please contact the system administrator to ensure that you have permission to login in portal.',
      'submitLogin':"Login",
      'submitCancel':"Cancel",
      'username':"Username",
      'password':"Password",
      'logout':"Logout",
      'login':"Login",
      'reset-pass':'Reset password',
      'change-pass':'Change the password',
      'drop-user':'Remove user account',
      'drop-user-ok':'User account removed',
      'drop-user-fail':'Failed to remove account',
      'drop-user-confirm':'The account will be permanently removed. Do you confirm?',
      'missing-user-pass':"Missing username or password!",
      'username-validation':"Insert an username",
      'password-validation':"Insert a password"
    }
  },
  changeLanguage(lang)
  {
    this.currentLanguage = lang;
    Authentication.buildLoginDropdownMenu();
  }

}
var AuthenticationService = {
  downloadFile(url, startDownloadCallback, doneDownloadCallback)
  {
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);

    var bearer=null;
    if(Authentication.hasToken())
    {
      
      //Check if token is expired or not. If is expired it will logout
      if(Authentication.expirationCheck())
      {
        window.location.reload();
        return;
      }

      bearer = "Bearer " + Authentication.getToken();
    }

    //Invokink callback, application should show loading or block button
    if(startDownloadCallback)
    {
        startDownloadCallback();
    }

    var xhr=new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = 'arraybuffer';
   
    //Adding authorization if token is present
    if(bearer!=null)
    {
      xhr.setRequestHeader("Authorization", bearer);
    }

    xhr.addEventListener('load',function()
        {
        if (xhr.status === 200){

            var arrayBuffer = xhr.response;

            var filename = AuthenticationService.getFilenameFromContentDisposition(xhr);

            AuthenticationService.saveByteArray(filename, arrayBuffer);

            //Invokink callback, application should hide loading or enable button
            if(doneDownloadCallback)
            {
                doneDownloadCallback();
            }
        }
    })
    xhr.send();
   
  },
  getFilenameFromContentDisposition(xhr)
  {
      var filename = "";
      var disposition = xhr.getResponseHeader('Content-Disposition');
      if (disposition && disposition.indexOf('filename') !== -1) {
          if(disposition.split("=").length==2)
          {
              filename=disposition.split("=")[1];
          }
      }
      return filename;
  },
  saveByteArray(filename, byte) {
    var blob = new Blob([byte], {type: "octet/stream"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    if(filename!="")
    {
        link.download = filename;
    }                
    link.click();
  },
  isAuthenticated()
  {
    return  Authentication.hasToken() && !Authentication.expirationCheck();
  },
  getBearer()
  { 
    var bearer="";
    if(this.isAuthenticated())
    {
      bearer = "Bearer " + Authentication.getToken();
    }
    return bearer;
  },
  getToken()
  { 
    var token="";
    if(this.isAuthenticated())
    {
      token = Authentication.getToken();
    }
    return token;
  }
}