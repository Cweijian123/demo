import '../../css/main.css'
const table = require('frler-scms-plugins/lib/table')
const spin = require('frler-scms-plugins/lib/spin')

const category = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  searchGroup: {
    Status: 0,
    SearchKeyType: 0,
    SearchKey: ""
  },
  userId: (JSON.parse(top.frBice.cookie.getCookie('frler_user'))).UserId,
  isAudit: false,
  categoryList: []
}

let modifyCategoty = null

window.onload = function() {
  category.isAudit = category.userId === 1 || category.userId === 16 || category.userId === 44
  getCategoryList()
  initDomsOpe()
}

function initDomsOpe() {
  $('#uploadPackageBtn').on('click', validateUploadPackage)
  $('input[name="zipfilenames"]').on('change', validateZipFile)
  $('textarea[name="remark"]').on('keyup', function() {
    top.frBice.form.removeFormError(this)
  })
  $('#auditPassBtn').on('click', function() {
    auditPackage(true)
  })
  $('#auditRejectBtn').on('click', function() {
    auditPackage(false)
  })
}

function getCategoryList() {
  spin.show()
  top.request.post(top.taskServer + top.api.CategoryGetList, false, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      category.categoryList = res.Data.categoryList
      renderCategoryList()
    } else {
      top.request.error(res)
    }
  })
}

function renderCategoryList() {
  const tableOptions = {
    tableId: 'categoryTb',
    datas: category.categoryList,
    columns: [
      { name: 'id', label: '分类ID', width: 80 },
      { name: 'categoryname', label: '分类名称' },
      { name: 'useinfo', label: '创建用户' },
      { name: 'created', label: '创建时间', width: 160, valueType: 'datetime' },
      { name: 'updated', label: '修改时间', width: 160, valueType: 'datetime' },
      { name: "", label: '操作', valueType: 'operate', width: category.isAudit ? 150 : 90 }
    ],
    configs: {
      C6: { html: true, className: 'text-center' }
    },
    states: {},
    valueOpe: {
      datetime: {
        getter: (dataValue, cell, dataGrid) => {
          return top.frBice.date.renderDateString(dataValue, true)
        }
      },
      operate: {
        getter: (dataValue, cell, dataGrid) => {
          return `<button class="btn btn-link btn-sm text-danger tb-ope" data-event="uploadPackage" data-index="${cell.rowIndex-1}">包上传</button>` + (category.isAudit ? `<button class="btn btn-link btn-sm text-danger tb-ope" data-event="audit" data-index="${cell.rowIndex-1}">审核包</button>` : ``)
        }
      },
    },
    height: parseInt($(document).height()) - 20,
    onRenderFunc: () => {
      $('#categoryTb .tb-ope').on('click', setTableOperate)
    }
  }
  table.renderTable(tableOptions)
}

function setTableOperate(event) {
  const target = $(event)[0].target
  const curEvent = $(target).attr('data-event')
  const curIndex = parseInt($(target).attr('data-index'))
  if (curEvent === 'uploadPackage') {
    triggerOperate(1, curIndex)
  } else if (curEvent === 'audit') {
    triggerOperate(2, curIndex)
  }
}

// 1-上传包  2-审核包
function triggerOperate(type, index) {
  if (type === 1) {
    showUploadPackage(index)
  } else if (type === 2) {
    showAuditPackage(index)
  }
}

/****************** 包上传 *******************/
function showUploadPackage(index) {
  modifyCategoty = category.categoryList[index]
  $('#uploadPackModal').modal('show')
  $('#uploadPackModal .modal-title').text(`${modifyCategoty.categoryname} - 包上传`)
  const form = $('form[name="uploadPackageForm"]')[0]
  form.reset()
  top.frBice.form.removeFormError(form.zipfilenames, true)
  top.frBice.form.removeFormError(form.remark, true)
}

function validateZipFile() {
  if (!top.frBice.formatter.isCompressFile(this)) {
    top.frBice.modal.zuiMessage('warning', '请选择格式为RAR/ZIP的文件')
    this.value = ""
    top.frBice.form.showFormError(this)
  } else {
    top.frBice.form.removeFormError(this)
  }
}

function validateUploadPackage() {
  const form = $('form[name="uploadPackageForm"]')[0]
  if (form.zipfilenames.value === "") {
    top.frBice.modal.zuiMessage('danger', '请选择版本包')
    top.frBice.form.showFormError(form.zipfilenames)
    return
  }
  if (form.remark.value === "") {
    top.frBice.modal.zuiMessage('danger', '请输入包说明')
    top.frBice.form.showFormError(form.remark)
    form.remark.focus()
    return
  }

  let formData = new FormData(form)
  formData.append("categoryid", modifyCategoty.id)
  top.frBice.modal.zuiMessage('success', '上传版本包成功')

  /*调试*/
  $('#uploadPackModal').modal('hide')
  return


  spin.show()
  top.request.post(window.taskServer + api.VersionUpload, formData, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      top.frBice.modal.zuiMessage('success', '上传版本包成功')
      $('#uploadPackModal').modal('hide')
      modifyCategoty = null
    } else {
      top.request.error(res)
    }
  }, true)
}

/***************** 包审核 *****************/
function showAuditPackage(index) {
  modifyCategoty = category.categoryList[index]
  $('#auditPackageModal').modal('show')
  $('#auditPackageModal .modal-title').text(`${modifyCategoty.categoryname} - 任务包审核`)
}

function auditPackage(bool) {
  top.frBice.modal.zuiMessage('success', '审核任务包成功')
  getCategoryList()
  $('#auditPackageModal').modal('hide')
  return
  spin.show()
  top.request.post(window.taskServer + api, auditData, (res) => {
    spin.hide()
    if (res.IsSuccess) {
      top.frBice.modal.zuiMessage('success', '审核任务包成功')
      $('#auditPackageModal').modal('hide')
      getCategoryList()
    } else {
      top.request.error(res)
    }
  })
}