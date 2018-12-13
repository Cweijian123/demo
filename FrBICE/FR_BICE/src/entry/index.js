module.exports.entry = {
  router: ['./src/router/router.js'],
  api: ['./src/store/utils/apiServer.js', './src/store/utils/apiData.js', './src/store/utils/request.js'],
  main: ['./src/index.js', './src/store/utils/utils.js'],
  login: ['./src/store/js/login.js'],
  sidebar: ['./src/router/sidebar.js']
}