import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/vue-admin-template/table/list',
    method: 'get',
    params
  })
}

export function get_account(params) {
  return request({
    url: '/get_account',
    method: 'post',
    data: params
  })
}
