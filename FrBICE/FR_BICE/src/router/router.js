window.href_static = ''

window.router = {
  protocol: 'http://',
  host: window.location.host,
  hostname: window.location.hostname,
  route: window.location.pathname,
  name: window.location.pathname.slice(window.location.pathname.lastIndexOf('/') + 1, window.location.pathname.lastIndexOf('.html')),
}