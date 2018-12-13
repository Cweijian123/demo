window.taskSideBar = [{
  title: '定时任务',
  icon: 'icon-check-board',
  children: [{
    title: '服务节点',
    id: 'serviceNodes',
    href: '/components/task/serviceNodes'
  }, {
    title: '任务类别',
    id: 'taskCategory',
    href: '/components/task/taskCategory'
  }, {
    title: '任务列表',
    id: 'taskList',
    href: '/components/task/taskList'
  }, {
    title: '任务命令',
    id: 'taskCommand',
    href: '/components/task/taskCommand'
  }]
}, {
  title: '任务日志',
  icon: ' icon-list-alt ',
  children: [{
    title: '定时任务',
    id: 'taskLog',
    href: '/components/task/taskLog'
  }]
}, {
  title: '性能监控',
  icon: 'icon-leaf',
  children: [{
    title: '定时任务',
    id: 'taskPerformance',
    href: '/components/task/taskPerformance'
  }]
}, {
  title: 'API',
  icon: 'icon-heart',
  children: [{
    title: 'Web Api监控',
    id: 'apiMonitoring',
    href: '/components/task/apiMonitoring'
  }]
}]