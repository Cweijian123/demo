import '../../css/main.css'
const chosen = require('frler-scms-plugins/lib/chosen')
const spin = require('frler-scms-plugins/lib/spin')
const table = require('frler-scms-plugins/lib/table')
const pager = require('frler-scms-plugins/lib/pager')
const tooltips = require('frler-scms-plugins/lib/tooltips')

const log = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  searchGroup: {
    NodeId: 0,
    CategoryId: 0,
    LogStarTime: "",
    LogEndTime: "",
    LogType: "",
    TaskName: "",
    MessageKey: ""
  },
  logList: []
}

const dropLists = {
  nodesDrop: [],
  categoryDrop: [],
  logTypeDrop: [{ Key: '调试日志', Value: 1 }, { Key: '普通日志', Value: 2 }, { Key: '错误日志', Value: 3 }]
}

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
  chosen.renderChosen('LogType', dropLists.logTypeDrop, 'Key', 'Value')
  chosen.initChosen()
  $('.container-fluid').removeClass('hide')
  initDomsOpe()
  resetLogList()
}


function initDomsOpe() {
  top.frBice.date.initDatePicker($('.form-date'))
  $('#searchBtn').on('click', getLogList)
  $('#resetBtn').on('click', resetLogList)
}

function resetLogList() {
  $('#NodeId').val("")
  $('#CategoryId').val("")
  $('#LogStarTime').val("")
  $('#LogEndTime').val("")
  $('#LogType').val("")
  $('#TaskName').val("")
  $('#MessageKey').val("")
  $('.chosen-select').trigger("chosen:updated")
  if (log.currentPage != 1 || log.pageSize != 20) {
    let logPager = $('#logPager').data('zui.pager')
    logPager.set(1, null, 20)
  } else {
    getLogList()
  }
}

function getLogList() {
  spin.show()
  let postData = {
    PageIndex: log.currentPage,
    PageSize: log.pageSize
  }
  log.searchGroup = {
    NodeId: $('#NodeId').val() === "" ? null : parseInt($('#NodeId').val()),
    CategoryId: $('#CategoryId').val() === "" ? null : parseInt($('#CategoryId').val()),
    LogStarTime: $('#LogStarTime').val() === "" ? null : $('#LogStarTime').val(),
    LogEndTime: $('#LogEndTime').val() === "" ? null : $('#LogEndTime').val(),
    LogType: $('#LogType').val() === "" ? null : parseInt($('#LogType').val()),
    TaskName: $('#TaskName').val(),
    MessageKey: $('#MessageKey').val()
  }
  postData = Object.assign(postData, log.searchGroup)
  top.request.post(top.taskServer + top.api.LogGetList, postData, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      log.logList = res.Data.PageModel.Items
      log.totalItems = res.Data.PageModel.TotalItems
      renderLogList()
    } else {
      top.request.error(res)
    }
  })
}

function renderLogList() {
  const tableOptions = {
    tableId: 'logTb',
    datas: log.logList,
    columns: [
      { name: 'Id', label: 'ID', width: 80 },
      { name: 'NodeName', label: '服务节点', valueType: 'tooltips' },
      { name: 'CategoryName', label: '任务类别' },
      { name: 'TaskName', label: '任务名称', width: 0.15, valueType: 'tooltips' },
      { name: 'LogMessage', label: '日志', width: 0.3, valueType: 'tooltips' },
      { name: "LogType", label: '类型', width: 90, valueType: 'logType' },
      { name: "LogTime", label: '记录时间', width: 150, valueType: 'time' }
    ],
    configs: {
      C2: { html: true },
      C4: { html: true },
      C5: { html: true }
    },
    states: {},
    valueOpe: {
      logType: {
        getter: (dataValue, cell, dataGrid) => {
          return dataValue == 1 ? '调试日志' : dataValue == 2 ? '普通日志' : dataValue == 3 ? '错误日志' : ''
        }
      },
      tooltips: {
        getter: (dataValue, cell, dataGrid) => {
          return tooltips.renderTooltips(dataValue)
        }
      },
      time: {
        getter: (dataValue, cell, dataGrid) => {
          return top.frBice.date.renderDateString(dataValue, true)
        }
      }
    },
    height: parseInt($(document).height()) - 132,
    onRenderFunc: () => {
      tooltips.hideToolTips()
      tooltips.initToolTips()
    }
  }

  const pagerOptions = {
    pagerId: 'logPager',
    currentPage: log.currentPage,
    pageSize: log.pageSize,
    totalItems: log.totalItems,
    sourceData: log,
    getListFunc: getLogList
  }

  table.renderTable(tableOptions)

  if (typeof $('#logPager').data('zui.pager') === 'undefined') {
    pager.renderPage(pagerOptions)
  } else {
    $('#logPager').data('zui.pager').set(log.currentPage, log.totalItems, log.pageSize)
  }
}