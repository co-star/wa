<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="钱包名称">
        <template slot-scope="scope">
          {{ scope.row.account_name }}
        </template>
      </el-table-column>
      <el-table-column label="可用余额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.core_liquid_balance }}</span>
        </template>
      </el-table-column>
      <el-table-column label="赎回中" align="center">
        <template slot-scope="scope">
          {{ scope.row.pageviews }}
        </template>
      </el-table-column>
      <el-table-column label="CPU已质押" align="center">
        <template slot-scope="scope">
          {{ scope.row.cpu_weight }}
        </template>
      </el-table-column>
      <el-table-column label="CPU已使用（%）" align="center">
        <template slot-scope="scope">
          {{ scope.row.cpu_limit.used?scope.row.cpu_limit.used/scope.row.cpu_limit.max:'' }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
// import { getList, get_account } from '@/api/table'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      name: 'cs3bo.wam'
    }
  },
  created() {
    this.fetchData(this.name)
  },
  methods: {
    fetchData(e) {
      this.listLoading = true
      fetch('https://wax.greymass.com/v1/chain/get_account',{
          method: 'POST',
          body: JSON.stringify({account_name: e}),
          mode: 'cors',
      }).then(res => {
          return res.json();
      }).then(json => {
          this.list = [{...json}]
      }).catch(err => {
          console.log('请求错误', err);
      })
      fetch('https://wax.api.atomicassets.io/atomicassets/v1/assets?owner='+e+'&page=1&limit=1000&order=desc&sort=asset_id',{
          method: 'get',
          mode: 'cors',
      }).then(res => {
          return res.json();
      }).then(json => {
          this.list = [{...this.list,...json}]
      }).catch(err => {
          console.log('请求错误', err);
      })
      fetch('https://wax.eosrio.io/v2/state/get_tokens?account='+e,{
          method: 'get',
          mode: 'cors',
      }).then(res => {
          return res.json();
      }).then(json => {
          this.list = [{...this.list,...json}]
      }).catch(err => {
          console.log('请求错误', err);
      })
      this.listLoading = false
    }
  }
}
</script>
