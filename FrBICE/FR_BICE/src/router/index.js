module.exports.route = [{
  _html: 'index',
  title: '首页',
  chunks: ['router', 'main']
}, {
  _html: 'components/login',
  title: '登录',
  chunks: ['router', 'api', 'main', 'login']
}, {
  _html: 'components/container',
  title: '页面主容器',
  chunks: ['router', 'api', 'sidebar', 'main', 'container']
}, {
  _html: 'components/control',
  title: '控制面板',
  chunks: ['router', 'main', 'control']
}, {
  _html: 'components/task/serviceNodes',
  title: '定时任务-服务节点',
  chunks: ['serviceNodes']
}, {
  _html: 'components/task/taskCategory',
  title: '定时任务-任务类别',
  chunks: ['taskCategory']
}, {
  _html: 'components/task/taskList',
  title: '定时任务-任务列表',
  chunks: ['taskList']
}, {
  _html: 'components/task/taskComps/createModifyTask',
  title: '定时任务-添加/编辑任务',
  chunks: ['createModifyTask']
}, {
  _html: 'components/task/taskComps/viewTask',
  title: '定时任务-任务详情',
  chunks: ['viewTask']
}, {
  _html: 'components/task/taskComps/taskLogSummary',
  title: '定时任务-当前任务日志',
  chunks: ['taskLogSummary']
}, {
  _html: 'components/task/taskCommand',
  title: '定时任务-任务命令',
  chunks: ['taskCommand']
}, {
  _html: 'components/task/taskLog',
  title: '定时任务-日志列表',
  chunks: ['taskLog']
}, {
  _html: 'components/task/taskPerformance',
  title: '定时任务-性能列表',
  chunks: ['taskPerformance']
}, {
  _html: 'components/task/apiMonitoring',
  title: 'webApi监控',
  chunks: ['router', 'main', 'apiMonitoring']
}]