<template>
  <div class="app-container">
    <el-button @click="addRow">新增</el-button>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      show-summary
      :summary-method="getSummaries"
      fit
      highlight-current-row
    >
      <el-table-column label="钱包名称" align="center" prop="account_name" />
      <el-table-column label="可用wax余额" align="center" prop="core_liquid_balance" />
      <el-table-column label="可用tlm余额" align="center" prop="tokens" />
      <el-table-column label="赎回中(wax)" align="center" prop="refund_request_cpu_amount" />
      <el-table-column label="CPU已质押(wax)" align="center" prop="self_delegated_bandwidth_cpu_weight" />
      <el-table-column label="CPU已使用（ms）" align="center" prop="cpu_limit_used" />
      <el-table-column label="CPU总量（ms）" align="center" prop="cpu_limit_max" />
      <el-table-column label="CPU已使用（%）" align="center" prop="cpu_limit" />
      <el-table-column label="nft" align="center" minWidth="360">
        <template slot-scope="scope">
          {{scope.row.nft.length}}个
          <div style="display:flex">
            <div v-for="(item,index) in scope.row.nft" :key="index">
              <img :src="'https://ipfs.io/ipfs/'+ item.img" alt="" width="50">
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="detel(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="新增账号查询"
      :visible.sync="dialogVisible"
      width="30%">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="账号" prop="name" :rules="{ required: true, message: '请填写账号', trigger: 'blur' }">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('form')">新 增</el-button>
          <el-button type="primary" @click="dialogVisible = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      lists: {
        nft: [],
        account_name: '',
        core_liquid_balance: 0,
        refund_request_cpu_amount: 0,
        self_delegated_bandwidth_cpu_weight: 0,
        cpu_limit_used: 0,
        cpu_limit_max: 0,
        cpu_limit: 0,
        tokens: ''
      },
      form:{
        name: ''
      },
      dialogVisible: false,
      listLoading: true,
      name: 'jb.ri.wam',
      nameLists: '',
      nameList: ''
    }
  },
  mounted(){
    this.gitList()
  },
  methods: {
    getSummaries(param) {
        const { columns, data } = param;
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = data.length + '个账号合计：';
            return;
          }
          const values = data.map(item => Number(item[column.property]));
          // console.log(column)
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
            sums[index] = sums[index].toFixed(2);
          } else {
            sums[index] = 'N/A';
          }
        });
        return sums;
    },
    detel(e){
      this.list.splice(e.$index,1)
      this.list.map(v=>{
        this.nameList += v.account_name + '-'
      })
      localStorage.setItem('nameList',this.nameList)
    },
    onSubmit(formName){
      this.$refs[formName].validate((valid) => {
          if (valid) {
            this.fetchData(this.form.name,1)
            this.dialogVisible = false
          }
      });
    },
    addRow(){
      this.dialogVisible = true
    },
    async fetchData(e,num) {
      if(e === '')return
      this.lists = this.$options.data().lists
      this.lists.nft = Object.assign([])
      this.listLoading = true
      await fetch('https://wax.greymass.com/v1/chain/get_account',{
          method: 'POST',
          body: JSON.stringify({account_name: e}),
          mode: 'cors',
      }).then(res => {
          return res.json();
      }).then(json => {
          const data = {...json}
          this.lists.account_name = data.account_name
          this.lists.core_liquid_balance = data.core_liquid_balance?Number(data.core_liquid_balance.split('W')[0]):0
          this.lists.refund_request_cpu_amount = data.refund_request?Number(data.refund_request.cpu_amount.split('W')[0]):0
          this.lists.cpu_limit_used = data.cpu_limit?data.cpu_limit.used/1000:0
          this.lists.cpu_limit_max = data.cpu_limit?data.cpu_limit.max/1000:0
          this.lists.cpu_limit = data.cpu_limit?(data.cpu_limit.used/data.cpu_limit.max).toFixed(2)*100:0
          this.lists.self_delegated_bandwidth_cpu_weight = data.self_delegated_bandwidth?Number(data.self_delegated_bandwidth.cpu_weight.split('W')[0]):0
      }).catch(err => {
          console.log('请求错误', err);
      })
      await fetch('https://wax.api.atomicassets.io/atomicassets/v1/assets?owner='+e+'&page=1&limit=1000&order=desc&sort=asset_id',{
          method: 'get',
          mode: 'cors',
      }).then(res => {
        return res.json();
      }).then(json => {
        const data = {...json}
        data.data.map(v=>{
          if(v.data.cardid){
            this.lists.nft.push({img:v.data.img,name:v.data.name})
          }
        })
      }).catch(err => {
          console.log('请求错误', err);
      })
      fetch('https://wax.eosrio.io/v2/state/get_tokens?account='+e,{
          method: 'get',
          mode: 'cors',
      }).then(res => {
          return res.json();
      }).then(json => {
        const data = {...json}
        data.tokens.map(v=>{
          if(v.symbol === 'TLM'){
            this.lists.tokens = v.amount
          }
        })
      }).catch(err => {
          console.log('请求错误', err);
      })
      this.list.push(this.lists)
      if(num){
        this.list.map(v=>{
          this.nameList += v.account_name + '-'
        })
        localStorage.setItem('nameList',this.nameList)
      }
      this.listLoading = false
    },
    async gitList(){
      let nameList = localStorage.getItem('nameList');
      console.log(nameList)
      if(nameList&&nameList.length > 0){
        for (const v of Array.from(new Set(nameList.split('-')))) {
          await this.fetchData(v)
        }
      }else{
        this.fetchData(this.name)
      }
    }
  }
}
</script>
