import '../../css/main.css'
import '../../css/task/taskList.css'
const chosen = require('frler-scms-plugins/lib/chosen')
const spin = require('frler-scms-plugins/lib/spin')
const table = require('frler-scms-plugins/lib/table')
const pager = require('frler-scms-plugins/lib/pager')
const tooltips = require('frler-scms-plugins/lib/tooltips')
const modal = require('frler-scms-plugins/lib/modal')

const task = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  searchGroup: {
    NodeId: 0,
    CategoryId: 0,
    TaskBeginCreateTime: "",
    TaskEndCreateTime: "",
    TaskState: "",
    TaskNameKeyWord: "",
    IsCold: false
  },
  taskList: []
}

const dropLists = {
  nodesDrop: [],
  categoryDrop: [],
  statusDrop: [{ Key: '停止', Value: 0 }, { Key: '进行中', Value: 1 }],
}

let modifyTask = null

window.onload = function() {
  getDropList()
}

function getDropList() {
  spin.show()
  top.request.post(top.taskServer + top.api.NodeGetList, true, (res) => {
    if (res.IsSuccess) {
      dropLists.nodesDrop = res.Data.nodeList
    } else {
      top.request.error(res)
    }
    top.request.post(top.taskServer + top.api.CategoryGetList, true, (res) => {
      spin.hide()
      if (res.IsSuccess) {
        dropLists.categoryDrop = res.Data.categoryList
      } else {
        top.request.error(res)
      }
      setChosenDrop()
    })
  })
}

function setChosenDrop() {
  chosen.renderChosen('NodeId', dropLists.nodesDrop, 'nodename', 'id')
  chosen.renderChosen('CategoryId', dropLists.categoryDrop, 'categoryname', 'id')
  chosen.renderChosen('TaskState', dropLists.statusDrop, 'Key', 'Value')
  chosen.initChosen()
  $('.container-fluid').removeClass('hide')
  initDomsOpe()
  resetTaskList()
}

function initDomsOpe() {
  top.frBice.date.initDatePicker($('.form-date'))
  $('#searchBtn').on('click', getTaskList)
  $('#resetBtn').on('click', resetTaskList)
  $('#coldTaskSwitch').on('change', getTaskList)
  $('#createTaskBtn').on('click', function() {
    triggerOperate(1)
  })
  $('#coldTaskBtn').on('click', function() {
    triggerOperate(4)
  })
}

function resetTaskList() {
  $('#NodeId').val("")
  $('#CategoryId').val("")
  $('#TaskBeginCreateTime').val("")
  $('#TaskEndCreateTime').val("")
  $('#TaskState').val("")
  $('#TaskNameKeyWord').val("")
  $('#coldTaskSwitch').prop('checked', false)
  $('.chosen-select').trigger("chosen:updated")
  if (task.currentPage != 1 || task.pageSize != 20) {
    let taskPager = $('#taskPager').data('zui.pager')
    taskPager.set(1, null, 20)
  } else {
    getTaskList()
  }
}

function getTaskList() {
  spin.show()
  let postData = {
    PageIndex: task.currentPage,
    PageSize: task.pageSize
  }
  task.searchGroup = {
    NodeId: $('#NodeId').val() === "" ? 0 : parseInt($('#NodeId').val()),
    CategoryId: $('#CategoryId').val() === "" ? 0 : parseInt($('#CategoryId').val()),
    TaskBeginCreateTime: $('#TaskBeginCreateTime').val() === "" ? "" : $('#TaskBeginCreateTime').val(),
    TaskEndCreateTime: $('#TaskEndCreateTime').val() === "" ? "" : $('#TaskEndCreateTime').val(),
    TaskState: $('#TaskState').val() === "" ? "" : parseInt($('#TaskState').val()),
    TaskNameKeyWord: $('#TaskNameKeyWord').val(),
    IsCold: $('#coldTaskSwitch').prop('checked')
  }
  postData = Object.assign(postData, task.searchGroup)
  top.request.post(top.taskServer + top.api.TaskGetList, postData, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      task.taskList = res.Data.PageModel.Items
      task.totalItems = res.Data.PageModel.TotalItems
      renderTaskList()
    } else {
      top.request.error(res)
    }
  })
}

function renderTaskList() {
  const tableOptions = {
    tableId: 'taskTb',
    datas: task.taskList,
    columns: [
      { name: 'TaskId', label: '任务ID', width: 80 },
      { name: 'NodeId', label: '节点ID', width: 80 },
      { name: 'TaskName', label: '任务名称' },
      { name: '', label: '当前运行状态', valueType: 'runStatus' },
      { name: '', label: '任务信息', valueType: 'taskInfo' },
      { name: 'TaskRemark', label: '备注' },
      { name: "", label: '操作', valueType: 'operate', width: 100 }
    ],
    configs: {
      C0: { style: { 'text-overflow': 'clip' } },
      C4: { html: true },
      C5: { html: true },
      C7: { html: true, className: 'operate-cell text-center' }
    },
    states: {
      fixedRightFrom: 7
    },
    valueOpe: {
      runStatus: {
        getter: (dataValue, cell, dataGrid) => {
          let list = [];
          const data = cell.config.data;
          const state = data.TaskState === 0 ? `<span class='text-danger'>已停止</span>` : `<span class='text-success'>已启动</span>`
          list.push(`【最近开始时间】${top.frBice.date.renderDateString(data.LastStartTime, true)}`)
          list.push(`【最近结束时间】${top.frBice.date.renderDateString(data.LastEndTime, true)}`)
          list.push(`【任务运行状态】${state}`)
          list.push(`【运行成功次数】${data.TaskRunCount}`)
          list.push(`【上次出错时间】${top.frBice.date.renderDateString(data.LastErrorTime, true)}`)
          list.push(`【连续错误次数】${data.TaskErrorCount}`)
          return table.renderCellList(list)
        }
      },
      taskInfo: {
        getter: (dataValue, cell, dataGrid) => {
          let list = [];
          const data = cell.config.data;
          list.push(`【分类】 ${data.CategoryName}`)
          list.push(`【节点】 ${data.NodeName}`)
          list.push(`【cron】 ${data.TaskCron}`)
          list.push(`【版本】 ${data.TaskVersion}`)
          list.push(`【修改时间】 ${top.frBice.date.renderDateString(data.Updated, true)}`)
          list.push(`【创建时间】 ${top.frBice.date.renderDateString(data.Created, true)}`)
          list.push(`【最近更新用户】 ${data.UserInfo}`)
          return table.renderCellList(list)
        }
      },
      operate: {
        getter: (dataValue, cell, dataGrid) => {
          const data = cell.config.data
          const view = `<p><button class="btn btn-sm btn-default tb-ope" data-index="${cell.rowIndex-1}" data-event="view">查看</button></p>`
          const modify = `<p><button class="btn btn-sm btn-default tb-ope" data-index="${cell.rowIndex-1}" data-event="modify">编辑</button></p>`
          const stop = `<p><button class="btn btn-sm btn-danger tb-ope" data-index="${cell.rowIndex-1}" data-event="stop">停止</button></p>`
          const open = `<p><button class="btn btn-sm btn-success tb-ope" data-index="${cell.rowIndex-1}" data-event="open">启动</button></p>`
          const log = `<p><button class="btn btn-sm btn-default tb-ope" data-index="${cell.rowIndex-1}" data-event="log">日志</button></p>`
          const operateList = []
          if (data.TaskState === 1) {
            // 已启动
            operateList.push(view, stop, log)
          } else if (data.TaskState === 0) {
            // 已停止
            operateList.push(modify, open, log)
          }
          return operateList.join('')
        }
      }
    },
    rowDefaultHeight: 140,
    checkable: true,
    height: parseInt($(document).height()) - 174,
    onRenderFunc: () => {
      $('#taskTb .tb-ope').off('click')
      $('#taskTb .tb-ope').on('click', setTableOperate)
      $('div.datagrid-checkbox').next().remove();
      tooltips.hideToolTips()
      tooltips.initToolTips()
    }
  }

  const pagerOptions = {
    pagerId: 'taskPager',
    currentPage: task.currentPage,
    pageSize: task.pageSize,
    totalItems: task.totalItems,
    sourceData: task,
    getListFunc: getTaskList
  }

  table.renderTable(tableOptions)

  if (typeof $('#taskPager').data('zui.pager') === 'undefined') {
    pager.renderPage(pagerOptions)
  } else {
    $('#taskPager').data('zui.pager').set(task.currentPage, task.totalItems, task.pageSize)
  }
}

function setTableOperate() {
  const event = $(this).attr('data-event')
  const index = $(this).attr('data-index')
  if (event === 'view') {
    triggerOperate(3, index)
  } else if (event === 'modify') {
    triggerOperate(2, index)
  } else if (event === 'stop') {
    triggerOperate(6, index)
  } else if (event === 'open') {
    triggerOperate(5, index)
  } else if (event === 'log') {
    triggerOperate(7, index)
  }
}

// 1-添加任务 2-编辑任务 3-查看任务 4-冷藏任务 5-启动任务 6-停止任务 7-查看日志
function triggerOperate(type, index) {
  switch (type) {
    case 1:
      showTaskModal(1)
      break
    case 2:
      showTaskModal(2, index)
      break
    case 3:
      showViewTask(index)
      break
    case 4:
      validateSelected(4)
      break
    case 5:
      changeTaskStatus(true, index)
      break
    case 6:
      changeTaskStatus(false, index)
      break
    case 7:
      showLogModal(index)
      break
    default:
      break
  }
}

/********************************添加/编辑任务************************************/
function showTaskModal(type, index) {
  modifyTask = type === 1 ? null : task.taskList[index]
  modal.createIframeModal({
    title: type === 1 ? '添加任务' : `编辑任务 - ${modifyTask.TaskName}`,
    height: $(window).height() - 90,
    data: [dropLists.nodesDrop, dropLists.categoryDrop, modifyTask],
    iframe: './taskComps/createModifyTask.html',
    successFunc: (datas) => {
      postTaskInfo(type, datas)
    },
    cancelFunc: cancelModal
  })
}

function postTaskInfo(type, datas) {
  const useApi = type === 1 ? top.api.TaskAdd : top.api.TaskUpdate
  spin.show()
  top.request.post(top.taskServer + useApi, datas, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      top.frBice.modal.zuiMessage('success', type === 1 ? '添加任务成功' : '修改任务成功')
      cancelModal()
      getTaskList()
    } else {
      top.request.error(res)
    }
  }, true)
}


/************************************查看任务*************************************/
function showViewTask(index) {
  modal.createIframeModal({
    title: '任务详情',
    height: $(window).height() - 120,
    data: [dropLists.nodesDrop, dropLists.categoryDrop, task.taskList[index]],
    iframe: './taskComps/viewTask.html',
    cancelFunc: cancelModal
  })
}

/************************************启停任务*************************************/
function changeTaskStatus(bool, index) {
  modal.zuiConfirm({
    content: `是否${bool?`启动`:`停止`}选中的任务`,
    onOk: () => {
      postChangeTaskStatus(bool, task.taskList[index].TaskId)
    },
    onCancel: () => { table.cancelSelected('taskTb') }
  })
}

function postChangeTaskStatus(bool, id) {
  const useApi = bool ? top.api.TaskStart : top.api.TaskStop
  spin.show()
  top.request.post(top.taskServer + useApi, id, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      top.frBice.modal.zuiMessage('success', `${bool?`启动`:`停止`}任务成功`)
      getTaskList()
    } else {
      top.request.error(res)
    }
  })
}

/***********************************批量操作***********************************/
// 4-冷藏
function validateSelected(type) {
  const selcData = table.getSelectedItems('taskTb')
  if (selcData.length < 1) {
    top.frBice.modal.zuiMessage('warning', `请选择任务进行${type === 4 ? `冷藏` : ``}操作`)
    return
  }
  switch (type) {
    case 4:
      validateColdTask(selcData)
      break
    default:
      break;
  }
}

/*********************************冷藏任务**********************************/
function validateColdTask(datas) {
  const len = datas.length;
  for (let i = 0; i < len; i++) {
    if (datas[i].TaskState === 1) {
      top.frBice.modal.zuiMessage('warning', `请选择运行状态为已停止的任务进行冷藏操作`)
      table.cancelSelected('taskTb')
      return
    }
  }
  modal.zuiConfirm({
    content: '是否冷藏选中的任务',
    onOk: () => { postColdTask(datas) },
    onCancel: () => { table.cancelSelected('taskTb') }
  })

}

function postColdTask(datas) {
  top.frBice.modal.zuiMessage('success', '冷藏任务成功')
  getTaskList()
}


/***********************************查看日志********************************/
function showLogModal(index) {
  modal.createIframeModal({
    title: `${task.taskList[index].TaskName} - 任务日志`,
    width: 900,
    height: 600,
    data: task.taskList[index],
    iframe: './taskComps/taskLogSummary.html',
    cancelFunc: cancelModal
  })
}

function cancelModal() {
  modifyTask = null
  table.cancelSelected('taskTb')
  modal.closeIframeModal(window.$modal)
}