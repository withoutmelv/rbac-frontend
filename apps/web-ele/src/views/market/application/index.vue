<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2 class="dashboard-title">企业应用中心</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加应用
      </el-button>
    </div>
    <div class="app-grid">
      <app-card
        v-for="app in apps"
        :key="app.id"
        :id="app.id"
        :title="app.title"
        :description="app.description"
        :icon="app.icon"
        :icon-color="app.iconColor"
        :code="app.code"
        @edit="handleEdit"
        @delete="handleDelete"
        @click="handleAppClick"
      />
    </div>

    <!-- 添加/编辑应用对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑应用' : '添加应用'"
      width="500px"
    >
      <el-form :model="appForm" label-width="80px">
        <el-form-item label="应用名称" required>
          <el-input v-model="appForm.title" />
        </el-form-item>
        <el-form-item label="编码" required>
          <el-input v-model="appForm.code" />
        </el-form-item>
        <el-form-item label="应用描述">
          <el-input v-model="appForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="appForm.icon">
            <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <el-icon><component :is="icon.value" /></el-icon>
              <span style="margin-left: 8px">{{ icon.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图标颜色">
          <el-color-picker v-model="appForm.iconColor" />
        </el-form-item>
        
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppCard from './app-card.vue'
import {appPage, createApp, updateApp, deleteApp} from '#/api/market/app';

interface App {
  id: string
  title: string
  description: string
  icon: string
  iconColor: string
  code: string
}

const apps = ref<App[]>([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const currentAppId = ref<string>('')

const appForm = ref({
  title: '',
  description: '',
  icon: 'Monitor',
  iconColor: '#409EFF',
  code: ''
})

const iconOptions = [
  { label: '监控', value: 'Monitor' },
  { label: '购物车', value: 'ShoppingCart' },
  { label: '商品', value: 'Goods' },
  { label: '设置', value: 'Setting' },
  { label: '数据', value: 'DataLine' },
  { label: '用户', value: 'User' }
]

const handleAdd = () => {
  isEdit.value = false
  currentAppId.value = ''
  appForm.value = {
    title: '',
    description: '',
    icon: 'Monitor',
    iconColor: '#409EFF',
    code: ''
  }
  dialogVisible.value = true
}

const handleEdit = (id: string) => {
  isEdit.value = true
  currentAppId.value = id
  const app = apps.value.find(a => a.id === id)
  if (app) {
    appForm.value = { ...app }
  }
  dialogVisible.value = true
}

const handleDelete = (id: string) => {
  // const index = apps.value.findIndex(a => a.id === id)
  // if (index !== -1) {
  //   apps.value.splice(index, 1)
  //   ElMessage.success('删除成功')
  // }
  deleteApp(id).then(() => {
    getAppData();
    ElMessage.success('删除成功')
  })
}

const handleSave = () => {
  if (!appForm.value.title || !appForm.value.code) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (isEdit.value && currentAppId.value) {
    const index = apps.value.findIndex(a => a.id === currentAppId.value)
    if (index !== -1) {
      // apps.value[index] = {
      //   ...apps.value[index],
      //   ...appForm.value
      // }
      updateApp({
        ...apps.value[index],
        ...appForm.value
      }).then(() => {
        ElMessage.success('更新成功');
        getAppData();
      })
    }
  } else {
    // apps.value.push({
    //   id: '',
    //   ...appForm.value
    // })
    createApp({
      ...appForm.value
    }).then(() => {
      ElMessage.success('添加成功')
      getAppData();
    })
  }
  dialogVisible.value = false
}

const handleAppClick = () => {
  // 处理应用点击事件
}

const getAppData = async () => {
  await appPage({
    pageNum: 1,
    pageSize: 9999,
  }).then((data: App[]) => {
    apps.value = data;
  })
}

onMounted(() => {
  getAppData();
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 
