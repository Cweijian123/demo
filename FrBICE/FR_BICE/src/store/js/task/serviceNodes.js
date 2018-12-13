import '../../css/main.css'
const table = require('frler-scms-plugins/lib/table')
const spin = require('frler-scms-plugins/lib/spin')

const nodes = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  searchGroup: {
    Status: 0,
    SearchKeyType: 0,
    SearchKey: ""
  },
  nodeList: []
}

window.onload = function() {
  getNodeList()
}

function getNodeList() {
  spin.show()
  top.request.post(top.taskServer + top.api.NodeGetList, false, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      nodes.nodeList = res.Data.nodeList
      renderNodeList()
    } else {
      top.request.error(res)
    }
  })
}

function renderNodeList() {
  const tableOptions = {
    tableId: 'nodeTb',
    datas: nodes.nodeList,
    columns: [
      { name: 'id', label: '节点ID', width: 80 },
      { name: 'nodename', label: '节点名称' },
      { name: 'nodeip', label: 'IP/Host' },
      { name: 'updated', label: '心跳时间', width: 160, valueType: 'datetime' },
      { name: 'created', label: '创建时间', width: 160, valueType: 'datetime' }
    ],
    configs: {},
    states: {},
    valueOpe: {
      datetime: {
        getter: (dataValue, cell, dataGrid) => {
          return top.frBice.date.renderDateString(dataValue, true)
        }
      }
    },
    height: parseInt($(document).height()) - 20,
    onRenderFunc: () => {}
  }
  table.renderTable(tableOptions)
}