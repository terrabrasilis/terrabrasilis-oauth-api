var Authentication = {
  oauthURL: "http://brazildatacube.dpi.inpe.br",
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
  },
  
  showAuthenticationModal() {

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
        class: "modal-dialog modal-dialog-centered",
        style: "min-width: 500px;"
      });

    $('#authentication-div').append(modalLoginDiv);

    //Modal Content div

    var modalContentDiv = $('<div>',
      {
        class: "modal-content"
      });
    modalLoginDiv.append(modalContentDiv);

    //Modal Header Div

    var modalTitle = '<h5 class="modal-title" id="exampleModalLongTitle">'+AuthenticationTranslation.getTranslated('login')+'</h5>';
    var modalCloseButton = '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

    var modalHeaderDiv = $('<div>',
      {
        class: "modal-header",
        html: modalTitle + modalCloseButton
      });
    modalContentDiv.append(modalHeaderDiv);

    //Modal Body Div
    var modalBodyDiv = $('<div>',
      {
        class: "modal-body",
        id: "authentication-body"
      });
    modalContentDiv.append(modalBodyDiv);

    //Modal Footer Div

    var modalCancelButton = '<button type="button" id="login-cancel-button" class="btn btn-secondary" data-dismiss="modal">'+AuthenticationTranslation.getTranslated('submitCancel')+'</button>';

    var modalLoginButton = '<button type="button" id="login-button" class="btn btn-primary">'+AuthenticationTranslation.getTranslated('submitLogin')+'</button>';

    var modalFooterDiv = $('<div>',
      {
        class: "modal-footer",
        html: modalCancelButton + modalLoginButton
      });
    modalContentDiv.append(modalFooterDiv);

    $('#login-button').click(function () {

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

    });


    // Login form alert 
    var loginFormAlertRow = $('<div>',
      {
        class: 'row',
        style: 'min-height: 60px;'
      });
    var loginFormAlertCol1 = $('<div>',
    {
      class: 'col-md-1'
    });
    var loginFormAlertCol2 = $('<div>',
    {
      class: 'col-md-10 my-auto'
    });
    var loginFormAlertCol3 = $('<div>',
    {
      class: 'col-md-1'
    });
    loginFormAlertCol1.appendTo(loginFormAlertRow);
    loginFormAlertCol2.appendTo(loginFormAlertRow);
    loginFormAlertCol3.appendTo(loginFormAlertRow);
    
    var loginFormAlert = $('<div>',
    {
      class: 'alert alert-danger alert-dismissible fade show align-middle justify-content-center',
      role: 'alert',
      id:'loginAlert'
    });
    loginFormAlert.hide();
    loginFormAlert.appendTo(loginFormAlertCol2);
    modalBodyDiv.append(loginFormAlertRow);


    // Login form input group
    var loginFormGroupRow = $('<div>',
      {
        class: 'row'
      });
    var loginFormGroupCol1 = $('<div>',
      {
        class: 'col-sm-2'
      });
    var loginFormGroupCol2 = $('<div>',
      {
        class: 'col-sm-8'
      });
    var loginFormGroupCol3 = $('<div>',
      {
        class: 'col-sm-2'
      });
    loginFormGroupRow.append(loginFormGroupCol1);
    loginFormGroupRow.append(loginFormGroupCol2);
    loginFormGroupRow.append(loginFormGroupCol3);

    loginFormGroupRow.appendTo(modalBodyDiv);

    //Login form group
    var loginFormGroup = $('<div class="form-group"></div>');
    var loginLabel = $('<label for="username-input">'+AuthenticationTranslation.getTranslated('username')+'</label>');
    var loginInput = $('<input type="text" class="form-control" id="username-input">');
    loginFormGroup.append(loginLabel);
    loginFormGroup.append(loginInput);
    loginFormGroup.appendTo(loginFormGroupCol2);

    //Password form group
    var pwdFormGroup = $('<div class="form-group"></div>');
    var pwdLabel = $('<label for="password-input">'+AuthenticationTranslation.getTranslated('password')+'</label>');
    var pwdInput = $('<input type="password" class="form-control" id="password-input">');
    pwdFormGroup.append(pwdLabel);
    pwdFormGroup.append(pwdInput);
    pwdFormGroup.appendTo(loginFormGroupCol2);
    $(function(){
      //Login when pressing enter
      pwdInput.keypress(function(e){
        if(e.which == 13) {
          $('#login-button').click();
        }
      })
    })

    $('#authentication-div').modal('show');

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
    }).fail(function (xhr, status, error) {
      console.log("Could not reach the API to obtain the user info: " + error);
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

    a.append('<i class="material-icons iconmobile">assignment </i><span id="maps-sup"><img id="login"  style="width:28px; height:28px; border-radius:50%" alt="Login" src="img/usuario.jpg" title="Autentique"></span>');
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
      'missing-user-pass':"Usuário ou senha não foram preenchidos!"

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
      'missing-user-pass':"Missing username or password!"
    }
  },
  changeLanguage(lang)
  {
    this.currentLanguage = lang;
    Authentication.buildLoginDropdownMenu();
  }

}