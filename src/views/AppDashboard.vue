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
        v-for="app in appList"
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
        <el-form-item label="应用名称">
          <el-input v-model="appForm.title" />
        </el-form-item>
        <el-form-item label="应用描述">
          <el-input v-model="appForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="应用编码">
          <el-input v-model="appForm.code" />
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
import { ref, computed } from 'vue'
import AppCard from '@/components/AppCard.vue'
import {
  Monitor,
  ShoppingCart,
  Goods,
  Setting,
  DataLine,
  User,
  Plus
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface App {
  id: number
  title: string
  description: string
  icon: string
  iconColor: string
  code: string
}

const appsJson = `[
  {
    "id": 1,
    "title": "MES系统",
    "description": "制造执行系统，实现生产过程的精细化管理",
    "icon": "Monitor",
    "iconColor": "#409EFF",
    "code": "mes"
  },
  {
    "id": 2,
    "title": "CRM系统",
    "description": "客户关系管理系统，提升客户服务质量",
    "icon": "User",
    "iconColor": "#67C23A",
    "code": "crm"
  },
  {
    "id": 3,
    "title": "ERP系统",
    "description": "企业资源计划系统，优化企业资源配置",
    "icon": "ShoppingCart",
    "iconColor": "#E6A23C",
    "code": "erp"
  },
  {
    "id": 4,
    "title": "WMS系统",
    "description": "仓库管理系统，实现仓储智能化管理",
    "icon": "Goods",
    "iconColor": "#F56C6C",
    "code": "wms"
  },
  {
    "id": 5,
    "title": "数据分析",
    "description": "企业数据可视化分析平台",
    "icon": "DataLine",
    "iconColor": "#909399",
    "code": "analytics"
  },
  {
    "id": 6,
    "title": "系统设置",
    "description": "系统配置与管理",
    "icon": "Setting",
    "iconColor": "#909399",
    "code": "settings"
  }
]`

const apps = ref<App[]>(JSON.parse(appsJson))
const appList = computed(() => apps.value)

const dialogVisible = ref(false)
const isEdit = ref(false)
const currentAppId = ref<number | null>(null)

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
  currentAppId.value = null
  appForm.value = {
    title: '',
    description: '',
    icon: 'Monitor',
    iconColor: '#409EFF',
    code: ''
  }
  dialogVisible.value = true
}

const handleEdit = (id: number) => {
  isEdit.value = true
  currentAppId.value = id
  const app = apps.value.find(a => a.id === id)
  if (app) {
    appForm.value = { ...app }
  }
  dialogVisible.value = true
}

const handleDelete = (id: number) => {
  const index = apps.value.findIndex(a => a.id === id)
  if (index !== -1) {
    apps.value.splice(index, 1)
    ElMessage.success('删除成功')
  }
}

const handleSave = () => {
  if (!appForm.value.title || !appForm.value.description || !appForm.value.code) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (isEdit.value && currentAppId.value) {
    const index = apps.value.findIndex(a => a.id === currentAppId.value)
    if (index !== -1) {
      apps.value[index] = {
        ...apps.value[index],
        ...appForm.value
      }
      ElMessage.success('更新成功')
    }
  } else {
    const newId = Math.max(...apps.value.map(a => a.id)) + 1
    apps.value.push({
      id: newId,
      ...appForm.value
    })
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

const handleAppClick = () => {
  // 处理应用点击事件
}
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
