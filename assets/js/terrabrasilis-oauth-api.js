var Authentication = {
  oauthURL: "http://oauth.dpi.inpe.br/api",
  tokenKey: "oauth.obt.inpe.br",
  service: "terrabrasilis",
  scope: "portal:dash:admin",
  expiredKey: "expired_token",
  usedInfoKey: "user_info",
  loginStatusChangedCallback: null,

  init(language, loginStatusChanged)
  {
    this.loginStatusChangedCallback=loginStatusChanged;
    AuthenticationTranslation.init(language);
    this.buildLoginDropdownMenu();
    this.addLoginCss();
    this.equalizeStorageAndCookieToken();        
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
      style: "position: absolute",
      class: "modal fade",
      tabindex: "-1",
      role: "dialog"
    });

    authenticationDiv.appendTo("body");

    //Modal div
    var modalLoginDiv = $('<div>',
      {
        id: "modal-login",
        class: "modal-dialog modal-dialog-centered ",
        style: "min-width: 500px;"
      });

    $('#authentication-div').append(modalLoginDiv);

    //Modal Content div

    var modalContentDiv = $('<div>',
      {
        class: "modal-content box-login"
      });
    modalLoginDiv.append(modalContentDiv);

    //Modal Header Div

    
    var modalCloseButton = '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

    var modalHeaderDiv = $('<div>',
      {
        class: "modal-header",
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
      class: 'alert alert-danger alert-dismissible fade show align-middle justify-content-center',
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

    $('#authentication-div').modal('show');

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
  handleError(message)
  {
    $('#loginAlert').html(message);
    $("#loginAlert").fadeTo(2000, 500).slideUp(500, function() {
      $("#loginAlert").slideUp(500);
    });
  },
  login(user, pass) {
    $.ajax(this.oauthURL + "/oauth/auth/login", {
      type: "POST",
      dataType: 'json',
      data: '{ "username": "' + user + '","password": "' + pass + '" }',
      contentType: "application/json",
    }).done(function (data) {

      Authentication.loadAppToken(data.access_token);
      
    }).fail(function (xhr, status, error) {
      console.log("Could not reach the API to authenticate the user: " + error);
      Authentication.handleError(AuthenticationTranslation.getTranslated('authenticationFailed'));
    });
  },
  loadUserInfo(userId, userToken) {
    $.ajax(this.oauthURL + "/oauth/users/" + userId, {
      type: "GET",
      dataType: 'json',
      headers: {
        "Authorization": "Bearer " + userToken
      },
      contentType: "application/json",
    }).done(function (data) {
      Authentication.setUserInfo(JSON.stringify(data));
      $('#authentication-div').modal('hide');
      Authentication.buildLoginDropdownMenu();
      Authentication.removeExpiredToken();
    }).fail(function (xhr, status, error) {
      console.log("Could not reach the API to obtain the user info: " + error);
      Authentication.logout();
    });
  },
  loadAppToken(userToken) {
    $.ajax(this.oauthURL + "/oauth/auth/token?service=" + this.service + "&scope=" + this.scope, {
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
      Authentication.loginStatusChanged();
    }).fail(function (xhr, status, error) {
      console.log("Could not reach the API to obtain App Token: " + error);
      $('#modal-container-warning').modal('show');
    });
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
  logout() {
    this.removeToken();
    this.removeUserInfo();
    this.removeExpiredToken();
    this.buildLoginDropdownMenu();
    this.loginStatusChanged();
    this.eraseCookie(this.tokenKey);
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
          class: "nav-item dropdown",
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
        class: "dropdown-menu submenu",
        style: "right: 0px; left: auto;"
      });
    dropDownDiv.attr("aria-labelledby", "navbarDropdownLoginLink");
    dropDownDiv.appendTo(li);
    
    if (this.hasToken()) {
      let info = this.getUserInfo();

      $('<a/>',
        {
          class: 'dropdown-item',
          html: '<b style="color:#6c757d;">' + info.name + ' / ' + info.institution + '</b>'
        }).appendTo(dropDownDiv);

      let a = $('<a/>',
        {
          class: 'dropdown-item',
          html: '<span >'+AuthenticationTranslation.getTranslated('logout')+'</span>'
        });
      a.attr("href", "javascript:Authentication.logout();");
      a.appendTo(dropDownDiv);
     

    }
    else {

      let a = $('<a/>',
        {
          class: 'dropdown-item',
          html: '<span >'+AuthenticationTranslation.getTranslated('login')+'</span>'
        });
      a.attr("href", "javascript:Authentication.showAuthenticationModal();");
      a.appendTo(dropDownDiv);
    }
    //Appending to navigation menu default UL

    $('#navigationBarUL').append(li);
 
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
