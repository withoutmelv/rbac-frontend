<template>
  <div class="app-card-container">
    <el-card 
      class="app-card" 
      :body-style="{ padding: '20px' }"
      shadow="hover"
    >
      <div class="app-icon">
        <el-icon :size="40" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="app-info">
        <h3 class="app-title" :title="title">{{ title }}</h3>
        <p class="app-description" :title="description">{{ description }}</p>
      </div>
      <div class="app-actions">
        <el-button 
          type="primary" 
          :icon="Edit"
          circle
          size="small"
          @click.stop="handleEdit"
        />
        <el-button 
          type="danger" 
          :icon="Delete"
          circle
          size="small"
          @click.stop="handleDelete"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps<{
  title: string
  description: string
  icon: string
  iconColor?: string
  code?: string
  id?: string
}>()

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'click'): void
}>()

const router = useRouter()

const handleClick = () => {
  if (props.code) {
    router.push(props.code)
  }
  emit('click')
}

const handleEdit = () => {
  if (props.id) {
    emit('edit', props.id)
  }
}

const handleDelete = () => {
  if (props.id) {
    ElMessageBox.confirm(
      '确定要删除这个应用吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      if (props.id) {
        emit('delete', props.id)
      }
    }).catch(() => {})
  }
}
</script>

<style scoped>
.app-card-container {
  width: 100%;
  max-width: 300px;
  margin: 10px;
  position: relative;
}

.app-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.app-card:hover {
  transform: translateY(-5px);
}

.app-icon {
  text-align: center;
  margin-bottom: 15px;
}

.app-info {
  text-align: center;
}

.app-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-description {
  margin: 10px 0 0;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: none;
  gap: 8px;
}

.app-card:hover .app-actions {
  display: flex;
}
</style> 
