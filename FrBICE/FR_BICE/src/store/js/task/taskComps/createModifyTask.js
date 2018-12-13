import '../../../css/main.css'
const chosen = require('frler-scms-plugins/lib/chosen')
const spin = require('frler-scms-plugins/lib/spin')

const dropLists = {
  nodesDrop: [],
  categoryDrop: [],
  versionDrop: []
}

let taskInfo = null

window.onload = function() {
  dropLists.nodesDrop = parent.$modal.options.data[0]
  dropLists.categoryDrop = parent.$modal.options.data[1]
  taskInfo = parent.$modal.options.data[2]
  if (taskInfo !== null) {
    getVersionDrop(taskInfo.CategoryId, true)
  } else {
    setChosenDrop()
  }
  setDomsOpe()
}

function getVersionDrop(id, getInfo) {
  spin.show()
  top.request.post(top.taskServer + top.api.CategoryDropList, id, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      dropLists.versionDrop = res.Data.versionList
      if (dropLists.versionDrop.length < 1) {
        top.frBice.modal.zuiMessage('warning', '当前任务类别的版本为空，请先前往任务类别添加版本再选择此项')
        top.frBice.form.showFormError($('#categoryId')[0])
      }
    } else {
      top.request.error(res)
    }
    if (getInfo) {
      setChosenDrop()
      getTaskInfo()
    } else {
      setVersionDrop()
    }
  })

}

function setChosenDrop() {
  chosen.renderChosen('categoryId', dropLists.categoryDrop, 'categoryname', 'id')
  chosen.renderChosen('nodeId', dropLists.nodesDrop, 'nodename', 'id')
  setVersionDrop()
  $('.chosen-container').css('width', '100%')
}

function setVersionDrop() {
  chosen.renderChosen('taskVersion', dropLists.versionDrop, 'remark', 'version')
  chosen.initChosen()
}

function setDomsOpe() {
  $('#postInfoBtn').text(taskInfo === null ? '添加' : '修改')
  $('#postInfoBtn').on('click', validateTaskInfo)
  $('#categoryId').on('change', function() {
    getVersionDrop(this.value === "" ? "" : parseInt(this.value))
  })
  $('#cancelModalBtn').on('click', parent.$modal.options.cancelFunc)
  $('input').on('keyup', function() {
    top.frBice.form.removeFormError(this)
  })
  $('textarea').on('keyup', function() {
    top.frBice.form.removeFormError(this)
  })
  $('select').on('change', function() {
    top.frBice.form.removeFormError(this)
  })
}

function getTaskInfo() {
  spin.show()
  top.request.post(top.taskServer + top.api.TaskGetInfo, taskInfo.TaskId, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      renderTaskInfo(res.Data)
    } else {
      top.request.error(res)
    }
  })

}

function renderTaskInfo(info) {
  for (var item in info.taskDataModel) {
    $(`*[name="${item}"]`).val(info.taskDataModel[item])
  }
  $('*[name="email"]').val(info.taskDataModel.taskemail)
  $('#taskVersion').val(info.versionModel.version)
  $('.chosen-select').trigger('chosen:updated')
}

function validateTaskInfo() {
  if ($('#taskName').val() === "") {
    top.frBice.modal.zuiMessage('danger', '请输入任务名称')
    warningFocus($('#taskName')[0])
    return
  }
  if ($('#categoryId').val() === "") {
    top.frBice.modal.zuiMessage('danger', '请选择任务类型')
    warningFocus($('#categoryId')[0])
    return
  }
  if ($('#nodeId').val() === "") {
    top.frBice.modal.zuiMessage('danger', '请选择服务节点')
    warningFocus($('#nodeId')[0])
    return
  }
  if ($('#taskCorn').val() === "") {
    top.frBice.modal.zuiMessage('danger', '请输入Corn表达式')
    warningFocus($('#taskCorn')[0])
    return
  }
  if ($('#spaceName').val() === "") {
    top.frBice.modal.zuiMessage('danger', '请输入exe\\dll任务类名称空间')
    warningFocus($('#spaceName')[0])
    return
  }
  if ($('#fileName').val() === "") {
    top.frBice.modal.zuiMessage('danger', '请输入exe\\dll名称')
    warningFocus($('#fileName')[0])
    return
  }
  if ($('#taskVersion').val() === "") {
    top.frBice.modal.zuiMessage('danger', '请选择任务版本')
    warningFocus($('#taskVersion')[0])
    return
  }
  if ($('#taskRemark').val() === "") {
    top.frBice.modal.zuiMessage('danger', '请输入备注')
    warningFocus($('#taskRemark')[0])
    return
  }
  if ($('#taskEmail').val() === "") {
    top.frBice.modal.zuiMessage('danger', '请输入通知邮箱')
    warningFocus($('#taskEmail')[0])
    return
  }

  const postData = new FormData(document.taskForm)
  postData.append('taskId', taskInfo === null ? 0 : taskInfo.TaskId)
  parent.$modal.options.successFunc(postData)
}

function warningFocus(o) {
  top.frBice.form.showFormError(o)
  o.focus()
}