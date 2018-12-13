window.request = {
  post: function(serverApi, data, callback, isForm) {
    var time = new Date(); //当前时间
    var random = Math.floor(Math.random() * time.getMilliseconds()); //随机数
    var md;
    var cookie = JSON.parse(frBice.cookie.getCookie('frler_user'))
    md = {
      userid: cookie == null ? "" : cookie.UserId, //用户登录后返回userids
      timestamp: time.valueOf(), //时间戳
      nonce: random, //随机数
      conditions: JSON.stringify(data)
    }
    var mdStr = ((cookie == null ? "" : cookie.Token) + md.userid + md.timestamp + md.nonce + md.conditions).toLowerCase();
    var postMdStr = md5(mdStr)
    var headers = { "userid": md.userid, "timestamp": md.timestamp, "nonce": md.nonce, "signature": postMdStr };
    !isForm ? headers['Content-Type'] = 'application/json' : null

    $.ajax({
      url: serverApi,
      data: isForm ? data : JSON.stringify(data),
      method: 'post',
      headers: headers,
      processData: isForm ? false : true,
      contentType: isForm ? false : true,
      success: function(data) {
        callback(data);
      },
      error: function(data) {
        window.top.frBice.spin.hide()
        window.top.frBice.modal.zuiMessage('danger', data.statusText, true)
      }
    })
  },
  error: function(res) {
    if (res.ApiStatusCode) {
      switch (res.ApiStatusCode) {
        case 401: //权限
          window.top.frBice.modal.zuiMessage('danger', res.Msg, true)
          break;
        case 407: //刷新
          window.top.frBice.modal.zuiMessage('danger', '页面超时，请刷新页面！', true)
          break;
        case 400: //退出登录
        case 403: //退出登录
        case 405: //退出登录
        case 406: //退出登录
        case 500: //退出登录
          window.top.frBice.modal.zuiMessage('danger', '登录超时，请重新登录！', true)
          if (window.top.frBice.cookie.getCookie('frler_user') != null) {
            window.top.frBice.cookie.delCookie('frler_user')
          }
          sessionStorage.removeItem('bice_tabs_items')
          window.top.open(window.href_static + '/components/login.html', '_self')
          break;
        default:
          window.top.frBice.modal.zuiMessage('danger', res.Msg, true)
          break;
      }
    } else {
      window.top.frBice.modal.zuiMessage('danger', res.Msg, true)
    }
  }
}