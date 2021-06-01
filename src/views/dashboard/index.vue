<template>
  <div class="app-container">
    <el-row style="margin-bottom: 5px;" type="flex" justify="end">
      <el-button
        type="primary"
        size="small"
        round
        @click="addTab(editableTabsValue)"
      >
        添加分组
      </el-button>
    </el-row>
    <el-tabs v-model="editableTabsValue" type="border-card" @tab-remove="removeTab">
      <el-tab-pane
        v-for="(item, index) in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
        :closable="index === editableTabs.length - 1"
      >
        <list-item :title="item.title" />
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import ListItem from './item.vue'
export default {
  components: {
    ListItem
  },
  data() {
    return {
      editableTabsValue: '1',
      editableTabs: [
        {
          title: '账号分组-1',
          name: '1'
        }
      ],
      tabIndex: 1
    }
  },
  mounted() {
    if (localStorage.getItem('editableTabs')) {
      this.editableTabs = JSON.parse(localStorage.getItem('editableTabs'))
    }
  },
  methods: {
    addTab(targetName) {
      const newTabName = this.editableTabs.length + 1 + ''
      this.editableTabs.push({
        title: '账号分组-' + newTabName,
        name: newTabName
      })
      localStorage.setItem('editableTabs', JSON.stringify(this.editableTabs))
      // this.editableTabsValue = newTabName
    },
    removeTab(targetName) {
      if (this.editableTabs.length === 1) {
        this.$notify({
          title: '警告',
          message: '最后一个分组不能删除',
          type: 'warning'
        })
        return
      }
      const tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter(tab => tab.name !== targetName)
      localStorage.setItem('editableTabs', JSON.stringify(this.editableTabs))
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
