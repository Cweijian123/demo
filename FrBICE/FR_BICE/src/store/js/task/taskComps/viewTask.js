import '../../../css/main.css'
import '../../../css/task/viewTask.css'
const spin = require('frler-scms-plugins/lib/spin')

window.onload = function() {
  initDomsOpe()
}

function initDomsOpe() {
  $('#cancelBtn').on('click', parent.$modal.options.cancelFunc)
  getTaskInfo()
}

function getTaskInfo() {
  spin.show()
  top.request.post(top.taskServer + top.api.TaskGetInfo, parent.$modal.options.data[2].TaskId, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      renderTaskInfo(res.Data)
    } else {
      top.request.error(res)
    }
  })
}

function renderTaskInfo(info) {
  const taskForm = $('form[name="taskForm"]')
  for (let item in info.taskDataModel) {
    taskForm.find(`*[data-key="${item}"]`).text(info.taskDataModel[item])
  }
  taskForm.find(`*[data-key="taskCategory"]`).text((parent.$modal.options.data[1].filter(item => item.id === info.taskDataModel.categoryid))[0].categoryname)
  taskForm.find(`*[data-key="taskNode"]`).text((parent.$modal.options.data[0].filter(item => item.id === info.taskDataModel.nodeid))[0].nodename)
  taskForm.find(`*[data-key="version"]`).text(info.versionModel.remark)
}