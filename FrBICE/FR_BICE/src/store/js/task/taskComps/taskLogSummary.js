import '../../../css/main.css'
const spin = require('frler-scms-plugins/lib/spin')
const table = require('frler-scms-plugins/lib/table')
const pager = require('frler-scms-plugins/lib/pager')
const tooltips = require('frler-scms-plugins/lib/tooltips')

const log = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  searchGroup: {
    TaskId: 0,
    StartTime: "",
    EndTime: "",
  },
  logList: []
}

window.onload = function() {
  initDomsOpe()
}

function initDomsOpe() {
  top.frBice.date.initDatePicker($('.form-date'))
  $('#searchBtn').on('click', getLogList)
  $('#resetBtn').on('click', resetLogList)
  $('#cancelBtn').on('click', parent.$modal.options.cancelFunc)
  resetLogList()
}

function resetLogList() {
  $('#StartTime').val("")
  $('#EndTime').val("")
  if (log.currentPage != 1 || log.pageSize != 20) {
    let logPager = $('#logPager').data('zui.pager')
    logPager.set(1, null, 20)
  } else {
    getLogList()
  }
}

function getLogList() {
  spin.show()
  log.searchGroup = {
    TaskId: parent.$modal.options.data.TaskId,
    StartTime: $('#StartTime').val(),
    EndTime: $('#EndTime').val()
  }
  let postData = {
    PageIndex: log.currentPage,
    PageSize: log.pageSize,
    SortField: "",
    SortOrder: "",
    Conditions: log.searchGroup
  }
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
      { name: 'LogMessage', label: '日志', width: 0.3, valueType: 'tooltips' },
      { name: "LogType", label: '类型', width: 90, valueType: 'logType' },
      { name: "LogTime", label: '记录时间', width: 150, valueType: 'time' }
    ],
    configs: {
      C2: { html: true }
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
    width: 880,
    height: parseInt($(document).height()) - 200,
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