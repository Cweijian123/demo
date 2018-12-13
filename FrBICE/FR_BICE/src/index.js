window.onload = function() {
  isLogin()
}

window.isLogin = function() {
  var currentUser = frBice.cookie.getCookie('frler_user')
  if (currentUser !== null) {
    if (window.top.router.name !== 'container')
      window.top.location.href = window.href_static + '/components/container.html'
  } else {
    if (window.router.name != 'login') {
      window.location.href = window.href_static + '/components/login.html'
    }
  }
}

window.logout = function() {
  frBice.spin.show()
  window.request.post(adminServer + api.UserLogOut, "", (res) => {
    if (res.IsSuccess) {
      frBice.cookie.delCookie('frler_user')
      sessionStorage.removeItem('bice_tabs_items')
      window.location.href = window.href_static + '/components/login.html'
    } else {
      window.request.error(res)
    }
    frBice.spin.hide()
  })
}