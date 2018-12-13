import '../css/login.css';

window.onload = function() {
  window.isLogin()
  $('#loginBtn').on('click', checkLoginForm)
  $('#resetBtn').on('click', resetLoginForm)
  $('#account').on('keyup', inputKeyUp)
  $('#password').on('keyup', inputKeyUp)
}

function inputKeyUp(e) {
  if (e.keyCode === 13) {
    checkLoginForm()
  } else {
    frBice.form.removeFormError(this)
  }
}

function checkLoginForm() {
  if (document.loginForm.Account.value === "") {
    $(document.loginForm.Account).parent().addClass('has-error')
    frBice.modal.zuiMessage('warning', '请输入账号', true)
    document.loginForm.Account.focus()
    return
  }

  if (document.loginForm.Password.value === "") {
    $(document.loginForm.Password).parent().addClass('has-error')
    frBice.modal.zuiMessage('warning', '请输入密码', true)
    document.loginForm.Password.focus()
    return
  }

  postLogin()
}

function resetLoginForm() {
  document.loginForm.reset()
  document.loginForm.Account.focus()
  frBice.form.removeFormError(document.loginForm.Account, true)
  frBice.form.removeFormError(document.loginForm.Password, true)
}

function postLogin() {
  const postData = {
    Email: document.loginForm.Account.value,
    Password: document.loginForm.Password.value
  }
  frBice.spin.show()
  window.request.post(adminServer + api.UserLogin, postData, (res) => {
    if (res.IsSuccess) {
      frBice.modal.zuiMessage('success', '登录成功', true)
      frBice.cookie.setCookie('frler_user', JSON.stringify(res.Data.Data))
      window.location.href = window.href_static + '/components/container.html'
    } else {
      window.request.error(res)
    }
    frBice.spin.hide()
  })
}