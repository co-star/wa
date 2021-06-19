<template>
  <div>
    <el-row class="mb-20">
      <el-button class="mr-20" :disabled="listLoading" @click="addRow">新增账号</el-button>
    </el-row>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      element-loading-background="rgba(0, 0, 0, 0)"
      border
      show-summary
      :summary-method="getSummaries"
      fit
      highlight-current-row
      max-height="750"
    >
      <el-table-column label="序号" type="index" width="80" align="center" fixed>
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="钱包名称" align="center" prop="account_name" width="100" />
      <el-table-column label="可用wax余额" align="center" prop="core_liquid_balance" width="80" />
      <el-table-column label="可用tlm余额" align="center" prop="tokens" width="80" />
      <el-table-column label="解除质押(wax)" align="center" prop="refund_request_cpu_amount" width="80" />
      <el-table-column label="CPU已质押(wax)" align="center" prop="self_delegated_bandwidth_cpu_weight" width="80" />
      <el-table-column label="CPU已使用(ms)" align="center" prop="cpu_limit_used" width="90" />
      <el-table-column label="CPU总量(ms)" align="center" prop="cpu_limit_max" width="90" />
      <el-table-column label="CPU已使用(%)" align="center" prop="cpu_limit" width="80">
        <template slot-scope="scope">
          <span :class="Number(scope.row.cpu_limit) < 80 ? 'green' : 'red'">{{ scope.row.cpu_limit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Racoon Coins" align="center" prop="racoon_coins" width="80" />
      <el-table-column label="未领取装备(NFT)" align="center" prop="new_claim" width="200">
        <template slot-scope="scope">
          {{ scope.row.nfts.length }}个
          <div style="display:flex;width:300px;flex-wrap: wrap;">
            <div v-for="(item,index) in scope.row.nfts" :key="index">
              <img :src="'https://ipfs.io/ipfs/'+ item" alt="" width="50">
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="装备(NFT)" align="center" min-width="680">
        <template slot-scope="scope">
          {{ scope.row.nft.length }}个
          <div style="display:flex;width:650px;flex-wrap: wrap;">
            <div v-for="(item,index) in scope.row.nft" :key="index">
              <img :src="'https://ipfs.io/ipfs/'+ item.img" alt="" width="50">
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="refreshRow(scope)">刷新</el-button>
          <el-button type="text" class="red" @click="detel(scope)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="新增账号"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="账号" prop="name" :rules="{ required: true, message: '请填写账号', trigger: 'blur' }">
          <el-input v-model="form.name" placeholder="" />
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
  name: 'ListItem',
  props: {
    title: {
      type: String,
      default: 'nameList'
    }
  },
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
        tokens: '',
        new_claim: 0,
        nfts: [],
        racoon_coins: ''
      },
      form: {
        name: ''
      },
      dialogVisible: false,
      listLoading: false,
      name: 'jb.ri.wam', // 5kqsu.wam-5xis4.wam
      nameList: ''
    }
  },
  mounted() {
    this.gitList()
  },
  methods: {
    refresh() {
      location.reload()
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = data.length + '个账号合计：'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        // console.log(column)
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[index] = sums[index].toFixed(2)
        } else {
          sums[index] = 'N/A'
        }
      })
      return sums
    },
    refreshRow(e) {
      this.fetchData(e.row.account_name, 0, e.$index)
    },
    detel(e) {
      this.listLoading = true
      this.list.splice(e.$index, 1)
      this.list.map(v => {
        this.nameList += v.account_name + '-'
      })
      localStorage.setItem(this.title, this.nameList)
      this.listLoading = false
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.fetchData(this.form.name, 1)
          this.dialogVisible = false
        }
      })
    },
    addRow() {
      this.form.name = ''
      this.dialogVisible = true
    },
    s2(num) {
      return num.toFixed(2)
    },
    async fetchData(e, num, index) {
      if (e === '') return
      this.lists = this.$options.data().lists
      this.lists.nft = Object.assign([])
      this.lists.nfts = Object.assign([])
      this.listLoading = true
      await fetch('https://wax.cryptolions.io/v1/chain/get_table_rows', {
        method: 'POST',
        body: JSON.stringify({
          code: "collectwhale",
          index_position: 1,
          json: true,
          key_type: "",
          limit: 1,
          lower_bound: "",
          reverse: false,
          scope: e,
          show_payer: false,
          table: "accounts",
          table_key: "",
          upper_bound: ""
        }),
        mode: 'cors'
      }).then(res => {
        return res.json()
      }).then(json => {
        const data = { ...json }
        // console.log(data.rows.length, e)
        this.lists.racoon_coins = data.rows.length>0?Number(data.rows[0].balance.split('R')[0]).toFixed(2):''
      }).catch(err => {
        this.lists.new_claim = ''
        console.log('请求错误', err)
      })
      await fetch('https://wax.greymass.com/v1/chain/get_account', {
        method: 'POST',
        body: JSON.stringify({ account_name: e }),
        mode: 'cors'
      }).then(res => {
        return res.json()
      }).then(json => {
        const data = { ...json }
        this.lists.account_name = data.account_name
        this.lists.core_liquid_balance = data.core_liquid_balance ? Number(data.core_liquid_balance.split('W')[0]).toFixed(2) : 0
        this.lists.refund_request_cpu_amount = data.refund_request ? Number(data.refund_request.cpu_amount.split('W')[0]).toFixed(2) : 0
        this.lists.cpu_limit_used = data.cpu_limit ? this.s2(data.cpu_limit.used / 1000) : 0
        this.lists.cpu_limit_max = data.cpu_limit ? this.s2(data.cpu_limit.max / 1000) : 0
        this.lists.cpu_limit = data.cpu_limit ? this.s2((data.cpu_limit.used / data.cpu_limit.max).toFixed(2) * 100) : 0
        this.lists.self_delegated_bandwidth_cpu_weight = data.self_delegated_bandwidth ? Number(data.self_delegated_bandwidth.cpu_weight.split('W')[0]).toFixed(2) : 0
      }).catch(err => {
        console.log('请求错误', err)
      })
      await fetch('https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=' + e + '&page=1&limit=1000&order=desc&sort=asset_id', {
        method: 'get',
        mode: 'cors'
      }).then(res => {
        return res.json()
      }).then(json => {
        const data = { ...json }
        data.data.map(v => {
          // if (v.data.cardid) {
            this.lists.nft.push({ img: v.data.img, name: v.data.name })
          // }
        })
      }).catch(err => {
        console.log('请求错误', err)
      })
      await fetch('https://lightapi.eosamsterdam.net/api/balances/wax/' + e, {
        method: 'get',
        mode: 'cors'
      }).then(res => {
        return res.json()
      }).then(json => {
        const data = { ...json }
        this.lists.account_name = data.account_name
        data.balances.map(v => {
          if (v.currency === 'TLM') {
            this.lists.tokens = v.amount
          }
        })
      }).catch(err => {
        console.log('请求错误', err)
      })
      await fetch('https://wax.greymass.com/v1/chain/get_table_rows', {
        method: 'POST',
        body: JSON.stringify({
          code: 'm.federation',
          index_position: 1,
          json: true,
          key_type: '',
          limit: '1',
          lower_bound: e,
          reverse: false,
          scope: 'm.federation',
          show_payer: false,
          table: 'claims',
          table_key: '',
          upper_bound: null
        }),
        mode: 'cors'
      }).then(res => {
        return res.json()
      }).then(json => {
        const data = { ...json }
        // console.log(data, e)
        data.rows.map(v => {
          if (v.miner === e) {
            this.lists.new_claim = v.template_ids.length
            // this.lists.nfts = v.template_ids
            v.template_ids.map( async i => {
              // this.getNewNfts(i)
              await fetch('https://wax.api.atomicassets.io/atomicassets/v1/assets?template_id=' + i + '&limit=1', {
                method: 'get',
                mode: 'cors'
              }).then(res => {
                return res.json()
              }).then(json => {
                const data = { ...json }
                this.lists.nfts.push(data.data[0].data.img)
              }).catch(err => {
                console.log('请求错误', err)
              })
            })
          }
        })
      }).catch(err => {
        this.lists.new_claim = ''
        console.log('请求错误', err)
      })
      if (index === undefined) { // 新增在最后添加
        this.list.push(this.lists)
      } else {
        this.$set(this.list, index, this.lists)
      }
      if (num) {
        this.list.map(v => {
          this.nameList += v.account_name + '-'
        })
        localStorage.setItem(this.title, this.nameList)
      }
      this.listLoading = false
    },
    async gitList() {
      const sleep = (delay) => {
        var start = (new Date()).getTime()
        while ((new Date()).getTime() - start < delay) {
          continue
        }
      }
      if (localStorage.getItem('nameList') && !localStorage.getItem(this.title)) { // 兼容
        localStorage.setItem(this.title, localStorage.getItem('nameList'))
        localStorage.removeItem('nameList')
      }
      const nameList = localStorage.getItem(this.title)
      if (nameList && nameList.length > 0) {
        for (const v of Array.from(new Set(nameList.split('-')))) {
          await this.fetchData(v)
          // sleep(666)
        }
      } else {
        this.fetchData(this.name)
      }
    },
    async getNewNfts(i) {
      await fetch('https://wax.api.atomicassets.io/atomicassets/v1/assets?template_id=' + i + '&limit=1', {
        method: 'get',
        mode: 'cors'
      }).then(res => {
        return res.json()
      }).then(json => {
        const data = { ...json }
        this.lists.nfts.push(data.data[0].data.img)
      }).catch(err => {
        console.log('请求错误', err)
      })
    },
    handleFetchQueue(urls, max, callback){
      const urlCount = urls.length;
      const requestsQueue = [];
      const results = [];
      let i = 0;
      const handleRequest = (url) => {
        const req = fetch(url).then(res => {
          const len = results.push(res);
          if (len < urlCount && i + 1 < urlCount) {
            requestsQueue.shift();
            handleRequest(urls[++i])
          } else if (len === urlCount) {
            'function' === typeof callback && callback(results)
          }
        }).catch(e => {
          results.push(e)
        });
        if (requestsQueue.push(req) < max) {
          handleRequest(urls[++i])
        }
      };
      handleRequest(urls[i])
    }
  }
}
</script>
<style lang="scss" scoped>
.green {
  color: #43B244;
}
.red {
  color: red;
}
.mb-20 {
  margin-bottom: 10px;
}
</style>
