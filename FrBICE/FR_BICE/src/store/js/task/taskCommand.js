import '../../css/main.css'
const chosen = require('frler-scms-plugins/lib/chosen')
const spin = require('frler-scms-plugins/lib/spin')
const table = require('frler-scms-plugins/lib/table')
const pager = require('frler-scms-plugins/lib/pager')
const tooltips = require('frler-scms-plugins/lib/tooltips')

const command = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  searchGroup: {
    NodeId: 0,
    CategoryId: 0,
    CmdStartTime: "",
    CmdEndTime: "",
    CommandExecStatus: "",
    TaskName: "",
  },
  commandList: []
}

const dropLists = {
  nodesDrop: [],
  categoryDrop: [],
  statusDrop: [{ Key: '未执行', Value: 0 }, { Key: '执行错误', Value: 1 }, { Key: '成功执行', Value: 2 }],
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
  chosen.renderChosen('CommandExecStatus', dropLists.statusDrop, 'Key', 'Value')
  chosen.initChosen()
  $('.container-fluid').removeClass('hide')
  initDomsOpe()
  resetCommandList()
}


function initDomsOpe() {
  top.frBice.date.initDatePicker($('.form-date'))
  $('#searchBtn').on('click', getCommandList)
  $('#resetBtn').on('click', resetCommandList)
}

function resetCommandList() {
  $('#NodeId').val("")
  $('#CategoryId').val("")
  $('#CmdStartTime').val("")
  $('#CmdEndTime').val("")
  $('#CommandExecStatus').val("")
  $('#TaskName').val("")
  $('.chosen-select').trigger("chosen:updated")
  if (command.currentPage != 1 || command.pageSize != 20) {
    let commandPager = $('#commandPager').data('zui.pager')
    commandPager.set(1, null, 20)
  } else {
    getCommandList()
  }
}

function getCommandList() {
  spin.show()
  let postData = {
    PageIndex: command.currentPage,
    PageSize: command.pageSize
  }
  command.searchGroup = {
    NodeId: $('#NodeId').val() === "" ? null : parseInt($('#NodeId').val()),
    CategoryId: $('#CategoryId').val() === "" ? null : parseInt($('#CategoryId').val()),
    CmdStartTime: $('#CmdStartTime').val() === "" ? null : $('#CmdStartTime').val(),
    CmdEndTime: $('#CmdEndTime').val() === "" ? null : $('#CmdEndTime').val(),
    CommandExecStatus: $('#CommandExecStatus').val() === "" ? null : parseInt($('#CommandExecStatus').val()),
    TaskName: $('#TaskName').val()
  }
  postData = Object.assign(postData, command.searchGroup)
  console.log(postData);
  top.request.post(top.taskServer + top.api.CommandGetList, postData, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      command.commandList = res.Data.PageModel.Items
      command.totalItems = res.Data.PageModel.TotalItems
      renderCommandList()
    } else {
      top.request.error(res)
    }
  })
}

function renderCommandList() {
  const tableOptions = {
    tableId: 'commandTb',
    datas: command.commandList,
    columns: [
      { name: 'Id', label: 'ID', width: 80 },
      { name: 'NodeName', label: '服务节点', width: 0.15, valueType: 'tooltips' },
      { name: 'CategoryName', label: '任务类别' },
      { name: 'TaskName', label: '任务名称', width: 0.25, valueType: 'tooltips' },
      { name: 'Name', label: '命令' },
      { name: "Status", label: '执行状态', width: 90, valueType: 'cmdStatus' },
      { name: "UserInfo", label: '创建人', width: 200 },
      { name: "Created", label: '创建时间', width: 150 }
    ],
    configs: {
      C2: { html: true },
      C4: { html: true }
    },
    states: {},
    valueOpe: {
      cmdStatus: {
        getter: (dataValue, cell, dataGrid) => {
          return dataValue == 2 ? '成功执行' : dataValue == 1 ? '执行错误' : dataValue == 0 ? '未执行' : ''
        }
      },
      tooltips: {
        getter: (dataValue, cell, dataGrid) => {
          return tooltips.renderTooltips(dataValue)
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
    pagerId: 'commandPager',
    currentPage: command.currentPage,
    pageSize: command.pageSize,
    totalItems: command.totalItems,
    sourceData: command,
    getListFunc: getCommandList
  }

  table.renderTable(tableOptions)
  if (typeof $('#commandPager').data('zui.pager') === 'undefined') {
    pager.renderPage(pagerOptions)
  } else {
    $('#commandPager').data('zui.pager').set(command.currentPage, command.totalItems, command.pageSize)
  }
}