window.onload = function() {
  setChosenDrop()
}

function setChosenDrop() {
  // frScms.chosen.initChosen()
  frBice.showContainer()
}

/*  
** 以下为参考代码

const top = window.top
const userManage = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  searchGroup: {
    Status: 0,
    SearchKeyType: 0,
    SearchKey: ""
  },
  userList: []
}

window.onload = function() {
  setChosenDrop()
  initBtnOpe()
  resetUserList()
}

function setChosenDrop(){
  frScms.chosen.initChosen()
  frScms.showContainer()
}

function initBtnOpe() {
  $('#SearchKey').on('keypress', function(e) {
    window.isEnterSearchKey(e, searchUserList)
  })
  $('#searchBtn').on('click', searchUserList)
  $('#resetBtn').on('click', resetUserList)
  $('#createUserBtn').on('click', () => {
    triggerOperate(1)
  })
  $('#resetPwdBtn').on('click', () => {
    triggerOperate(4)
  })
  $('#enableUserBtn').on('click', () => {
    triggerOperate(6, true)
  })
  $('#disableUserBtn').on('click', () => {
    triggerOperate(6, false)
  })
}

function resetUserList() {
  $('#Status').val("")
  $("#Status").trigger("chosen:updated")
  $('#SearchKeyType').val("")
  $("#SearchKeyType").trigger("chosen:updated");
  $('#SearchKey').val("")
  if (userManage.currentPage != 1 || userManage.pageSize != 20) {
    let userPager = $('#userPager').data('zui.pager')
    userPager.set(1, null, 20)
  } else {
    getUserList()
  }
}

function searchUserList() {
  userManage.currentPage = 1
  getUserList()
}

function getUserList() {
  frScms.spin.show()
  userManage.searchGroup = {
    Status: $('#Status').val() === "" ? 0 : parseInt($('#Status').val()),
    SearchKeyType: $('#SearchKeyType').val() === "" ? 0 : parseInt($('#SearchKeyType').val()),
    SearchKey: $('#SearchKey').val()
  }
  const init = {
    PageIndex: userManage.currentPage,
    PageSize: userManage.pageSize,
    SortField: "",
    SortOrder: "",
    Conditions: userManage.searchGroup
  }
  top.request.post(top.consoleServer + top.api.UserGetList, init, (res) => {
    frScms.spin.hide()
    if (res.IsSuccess) {
      userManage.userList = res.Data.PageModel.Items
      userManage.totalItems = res.Data.PageModel.TotalItems
      renderUserList()
    } else {
      top.request.error(res)
    }
  })
}

function renderUserList() {
  const tableOptions = {
    tableId: 'userTb',
    datas: userManage.userList,
    columns: [
      { name: 'UserName', label: '用户名称' },
      { name: 'Sex', label: '性别', valueType: 'sex' },
      { name: 'Email', label: '邮箱' },
      { name: 'Phone', label: '电话' },
      { name: 'Status', label: '状态', valueType: 'userStatus', width: 60 },
      { name: 'CreateTime', label: '注册时间', valueType: 'date', width: 120 },
      { name: "", label: '操作', valueType: 'operate', width: 180, align: 'center' }
    ],
    configs: {
      C0: { style: { 'text-overflow': 'clip' } },
      C5: { html: true },
      C7: { html: true, className: 'operate-cell text-center', style: { width: 'auto' } }
    },
    states: {
      fixedRightFrom: 7
    },
    valueOpe: {
      operate: {
        getter: (dataValue, cell, dataGrid) => { return '<button class="btn btn-link btn-sm" data-event="modifyUser" data-index="' + (cell.rowIndex - 1) + '">编辑</button><button class="btn btn-link btn-sm" data-event="resetPwd" data-index="' + (cell.rowIndex - 1) + '">重置密码</button><button class="btn btn-link btn-sm" data-event="changeStatus" data-index="' + (cell.rowIndex - 1) + '">' + (cell.config.data.Status === 1 ? '禁用' : '启用') + '</button>' }
      },
      sex: {
        getter: (dataValue, cell, dataGrid) => { return dataValue === 1 ? '男' : '女' }
      },
      userStatus: {
        getter: (dataValue, cell, dataGrid) => { return dataValue === 1 ? '<span class="text-success">已启用</span>' : '<span class="text-danger">已禁用</span>'; }
      }
    },
    checkable: true,
    height: parseInt($(document).height()) - 170,
    onRenderFunc: () => {
      $('#userTb div.datagrid-cell-cell').off('click')
      $('#userTb div.datagrid-cell-cell').on('click', setTableOperate)
      $('div.datagrid-checkbox').next().remove();
    }
  }

  const pagerOptions = {
    pagerId: 'userPager',
    currentPage: userManage.currentPage,
    pageSize: userManage.pageSize,
    totalItems: userManage.totalItems,
    sourceData: userManage,
    getListFunc: getUserList
  }

  frScms.table.renderTable(tableOptions)
  if (typeof $('#userPager').data('zui.pager') === 'undefined') {
    frScms.pager.renderPage(pagerOptions)
  } else {
    $('#userPager').data('zui.pager').set(userManage.currentPage, userManage.totalItems, userManage.pageSize)
  }
}

function setTableOperate() {
  const target = $(event)[0].target
  const curEvent = $(target).attr('data-event')
  const curIndex = parseInt($(target).attr('data-index'))
  frScms.table.cancelSelected('userTb')
  if (curEvent === 'modifyUser') {
    triggerOperate(2, curIndex)
  } else if (curEvent === 'resetPwd') {
    triggerOperate(3, curIndex)
  } else if (curEvent === 'changeStatus') {
    triggerOperate(5, curIndex)
  }
}

// 1-添加  2-编辑(含index)  3-单个重置密码(含index)  4-批量重置密码  5-单个启禁用  6-批量启禁用
function triggerOperate(type, index) {
  switch (type) {
    case 1:
    case 2:
      showUserModal(index)
      break
    case 3:
    case 4:
      confirmResetPwd(index)
      break
    case 5:
    case 6:
      const statusTo = typeof index === 'boolean' ? (index === true ? 1 : 2) : (userManage.userList[index].Status === 1 ? 2 : 1)
      confirmChangeStatus(index, statusTo)
      break
  }
}

// 打开添加/编辑用户模态框
function showUserModal(index) {
  const isModify = index != undefined
  if (!isModify) {
    frScms.table.cancelSelected('userTb');
  }
  const options = {
    title: isModify ? '编辑用户' : '添加用户',
    height: '420px',
    data: isModify ? userManage.userList[index] : null,
    successFunc: () => {
      getUserList()
      frScms.modal.closeIframeModal(window.$modal)
    },
    cancelFunc: () => {
      frScms.table.cancelSelected('userTb')
      frScms.modal.closeIframeModal(window.$modal)
    },
    iframe: window.href_static + '/components/system/systemComps/addOrEditUser.html',
  }
  frScms.modal.createIframeModal(options)
}

function confirmResetPwd(index) {
  const isBatch = index == undefined
  const resetUsers = isBatch ? frScms.table.getSelectedItems('userTb') : [userManage.userList[index]]
  if (resetUsers.length < 1) {
    frScms.modal.zuiMessage('warning', '请选择用户进行重置密码操作')
    return
  }

  frScms.modal.zuiConfirm({
    content: '是否对选中用户进行重置密码操作',
    onOk: () => {
      const postIds = frScms.arrayFunc.arrangeSelected(resetUsers, 'Id')
      postResetPwd(postIds)
    },
    onCancel: () => {
      frScms.table.cancelSelected('userTb')
    }
  })
}

function postResetPwd(ids) {
  frScms.spin.show()
  top.request.post(top.consoleServer + top.api.UserReSetPassword, ids, (res) => {
    frScms.spin.hide()
    if (res.IsSuccess) {
      frScms.modal.zuiMessage('success', '重置密码成功')
      frScms.table.cancelSelected('userTb')
    } else {
      top.request.error(res)
    }
  })
}

function confirmChangeStatus(index, statusTo) {
  let changeStatusUsers = []
  if (typeof index === 'boolean') {
    // 批量 需检查状态
    changeStatusUsers = frScms.table.getSelectedItems('userTb')
    const usersLen = changeStatusUsers.length
    if (usersLen < 1) {
      frScms.modal.zuiMessage('warning', '请选择用户进行' + (statusTo == 1 ? '启用' : '禁用') + '操作')
      return
    }
    for (let i = 0; i < usersLen; i++) {
      if (changeStatusUsers[i] != null && statusTo == changeStatusUsers[i].Status) {
        frScms.modal.zuiMessage('warning', '选中用户中含有状态为' + (statusTo == 1 ? '已启用' : '已禁用') + '的用户，请检查')
        return
      }
    }
  } else {
    changeStatusUsers.push(userManage.userList[index])
  }
  frScms.modal.zuiConfirm({
    content: '是否将选中用户的状态修改为' + (statusTo == 1 ? '启用' : '禁用'),
    onOk: () => {
      const postIds = frScms.arrayFunc.arrangeSelected(changeStatusUsers, 'Id')
      postChangeUserStatus(postIds, statusTo)
    },
    onCancel: () => {
      frScms.table.cancelSelected('userTb')
    }
  })
}

function postChangeUserStatus(ids, statusTo) {
  frScms.spin.show()
  const postData = {
    Id: ids,
    Status: statusTo
  }
  top.request.post(top.consoleServer + top.api.UserChangeStatus, postData, (res) => {
    frScms.spin.hide()
    if (res.IsSuccess) {
      frScms.modal.zuiMessage('success', '修改用户状态成功')
      getUserList()
    } else {
      top.request.error(res)
    }
  })
}
*/