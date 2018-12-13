import '../../css/main.css'
const chosen = require('frler-scms-plugins/lib/chosen')
const spin = require('frler-scms-plugins/lib/spin')
const table = require('frler-scms-plugins/lib/table')
const pager = require('frler-scms-plugins/lib/pager')
const tooltips = require('frler-scms-plugins/lib/tooltips')

const performance = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  searchGroup: {
    NodeId: 0,
    CategoryId: 0,
    TaskName: "",
  },
  performanceList: []
}

const dropLists = {
  nodesDrop: [],
  categoryDrop: []
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
  chosen.initChosen()
  $('.container-fluid').removeClass('hide')
  initDomsOpe()
  resetPerformanceList()
}


function initDomsOpe() {
  $('#searchBtn').on('click', getPerformanceList)
  $('#resetBtn').on('click', resetPerformanceList)
}

function resetPerformanceList() {
  $('#NodeId').val(1)
  $('#CategoryId').val("")
  $('#TaskName').val("")
  $('.chosen-select').trigger("chosen:updated")
  if (performance.currentPage != 1 || performance.pageSize != 20) {
    let performancePager = $('#performancePager').data('zui.pager')
    performancePager.set(1, null, 20)
  } else {
    getPerformanceList()
  }
}

function getPerformanceList() {
  spin.show()
  let postData = {
    PageIndex: performance.currentPage,
    PageSize: performance.pageSize
  }
  performance.searchGroup = {
    NodeId: $('#NodeId').val() === "" ? null : parseInt($('#NodeId').val()),
    CategoryId: $('#CategoryId').val() === "" ? null : parseInt($('#CategoryId').val()),
    TaskName: $('#TaskName').val()
  }
  postData = Object.assign(postData, performance.searchGroup)
  top.request.post(top.taskServer + top.api.PerformanceGetList, postData, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      performance.performanceList = res.Data.reslutList
      renderPerformanceList()
    } else {
      top.request.error(res)
    }
  })
}

function renderPerformanceList() {
  const tableOptions = {
    tableId: 'performanceTb',
    datas: performance.performanceList,
    columns: [
      { name: 'NodeName', label: '服务节点', valueType: 'tooltips' },
      { name: 'CategoryName', label: '任务类别' },
      { name: 'TaskName', label: '任务名称', width: 0.15, valueType: 'tooltips' },
      { name: 'Cpu', label: 'CPU(总CPU时间单位:秒)' },
      { name: "Memory", label: '内存(单位:兆)' },
      { name: "Installdirsize", label: '应用大小(单位:兆)' },
      { name: "Lastupdate", label: '最后更新时间', width: 150, valueType: 'time' },
    ],
    configs: {
      C1: { html: true },
      C3: { html: true },
      C4: { html: true }
    },
    states: {},
    valueOpe: {
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
    height: parseInt($(document).height()) - 74,
    onRenderFunc: () => {
      tooltips.hideToolTips()
      tooltips.initToolTips()
    }
  }
  table.renderTable(tableOptions)
}