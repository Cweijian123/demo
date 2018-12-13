import '../css/container.css'

let bice_tabs_items = sessionStorage.getItem('bice_tabs_items')
let tabs = setTabs()

window.onload = function() {
  window.isLogin()
  initContainerOpe()
}

function initContainerOpe() {
  $('#logoutBtn').on('click', window.logout)
  $('#nav a').on('click', triggerSideBar)
  initUserMsg()
  initSideBar()
  initTabs()
}

function initUserMsg() {
  // $('#username').html((JSON.parse(frBice.cookie.getCookie('frler_user'))).UserName + ' <b class="caret"></b>');
  $('#username').html(`${JSON.parse(frBice.cookie.getCookie('frler_user')).UserName} <b class="caret"></b>`)
}

function initSideBar() {
  let sideList = []
  let sideHtml = []
  let sideIconHtml = ['<li class="active"><a href="javascript:;"><i class="icon icon-list-ul"></i></a></li>']
  let bice_side = sessionStorage.getItem('bice_side')
  switch (bice_side) {
    case 'task':
      sideList = taskSideBar
      break
    default:
      sideList = taskSideBar
      break
  }

  $.each(sideList, (index, item) => {
    sideHtml.push(`<li class="nav-heading">${item.title}</li>`)
    sideIconHtml.push(`<li><a href="javascript:void(0);"><i class="icon ${item.icon}"></i></a></li>`)
    if (item.children.length > 0) {
      $.each(item.children, (cindex, citem) => {
        sideHtml.push(`<li><a href="javascript:void(0);" data-parent="${item.title}" data-href="${citem.href}" data-id="${citem.id}">${citem.title}</a></li>`)
      })
    }
  })
  $('#sideNav').html('')
  $('#sideIcon').html('')
  $(sideHtml.join('')).appendTo($('#sideNav'))
  $(sideIconHtml.join('')).appendTo($('#sideIcon'))
  $('#sideNav a').off('click')
  $('#sideNav a').on('click', triggerTabs)
}

function triggerSideBar() {
  $('#nav li').removeClass('active')
  $(this).addClass('active')
  sessionStorage.setItem('bice_side', $(this).attr('data-side'))
  initSideBar()
}

function initTabs() {
  $('#tabs').tabs({
    tabs: tabs.bice_tabs,
    defaultTab: tabs.active_tabs.id,
    onClose: function(tab) { clostTabs(tab) },
    onOpen: function(tab) { if (tab.id === tabs.active_tabs.id) { return } activeTabs(tab) }
  })
}

function setTabs() {
  let current = null
  if (bice_tabs_items == null) {
    current = setConsolePageDefault()
  } else {
    // 其余以浏览器中存储为准
    current = JSON.parse(bice_tabs_items)
  }
  return current
}

function activeTabs(tab) {
  let bice_tabs_items = {
    bice_tabs: tabs.bice_tabs,
    active_tabs: tab
  }
  tabs = bice_tabs_items
  sessionStorage.setItem('bice_tabs_items', JSON.stringify(bice_tabs_items))
  $('#tabs').tabs({ tabs: tabs.bice_tabs });
}

function clostTabs(tab) {
  let delIndex;
  $.each(tabs.bice_tabs, function(index, item) {
    if (item.title === tab.title) {
      delIndex = index
    }
  })
  tabs.bice_tabs.splice(delIndex, 1)
  if (tabs.bice_tabs.length < 1) {
    setConsolePageDefault()
  }
}

function triggerTabs(e) {
  let existIndex,
    target = $(e.target)
  $.each(tabs.bice_tabs, function(index, item) {
    if (item.id === target.attr('data-id')) {
      existIndex = index
    }
  })
  if (existIndex != undefined) tabs.bice_tabs.splice(existIndex, 1)
  let openTabs = {
    url: window.router.protocol + window.router.host + window.href_static + e.target.getAttribute('data-href') + '.html',
    type: 'iframe',
    title: `${target.attr('data-parent')} - ${target.text()}`,
    id: target.attr('data-id')
  }
  tabs.bice_tabs.push(openTabs)
  let myTabs = $('#tabs').data('zui.tabs');
  myTabs.open(openTabs);
  activeTabs(openTabs)
  e.preventDefault()
}

function setConsolePageDefault() {
  let current = {
    bice_tabs: [],
    active_tabs: {}
  }
  const control_tabs = {
    title: '控制面板',
    url: window.router.protocol + window.router.host + window.href_static + '/components/control.html',
    type: 'iframe',
    id: 'control',
    forbidClose: true
  }
  current.bice_tabs = [control_tabs]
  current.active_tabs = control_tabs
  sessionStorage.setItem('bice_tabs_items', JSON.stringify(current))
  return current
}