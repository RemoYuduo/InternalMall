<template>
  <AdminLayout>
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else class="dashboard-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>系统信息</span>
                </div>
              </template>
              <div class="card-content">
                <div class="info-item">
                  <span class="info-label">状态:</span>
                  <el-tag type="success">{{ systemInfo.status }}</el-tag>
                </div>
                <div class="info-item">
                  <span class="info-label">版本:</span>
                  <span>{{ systemInfo.version }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">更新时间:</span>
                  <span>{{ formatDate(systemInfo.timestamp) }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>管理员信息</span>
                </div>
              </template>
              <div class="card-content">
                <div class="info-item">
                  <span class="info-label">用户名:</span>
                  <span>{{ userInfo.username }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">ID:</span>
                  <span>{{ userInfo.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">角色:</span>
                  <el-tag type="warning">管理员</el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>快速操作</span>
                </div>
              </template>
              <div class="card-content">
                <div class="quick-actions">
                  <el-button type="primary" @click="testConnection">
                    连通性测试
                  </el-button>
                  <el-button type="success" @click="checkSystemStatus">
                    检查系统状态
                  </el-button>
                  <el-button @click="$router.push('/')">
                    返回首页
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>系统消息</span>
                </div>
              </template>
              <div class="card-content">
                <el-alert 
                  title="欢迎使用管理员系统" 
                  type="success" 
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <p>您已成功登录管理员系统，可以管理商品、订单和用户。</p>
                  </template>
                </el-alert>
              </div>
            </el-card>
          </el-col>
        </el-row>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { apiAdmin, apiAuth, apiHealth } from '@/api';
import { useAuthStore } from '@/stores/auth';
import AdminLayout from '@/components/layout/AdminLayout.vue';

const router = useRouter();
const authStore = useAuthStore();

// 加载状态
const loading = ref(true);

// 系统信息
const systemInfo = ref({
  status: 'running',
  version: '1.0.0',
  timestamp: null
});

// 用户信息
const userInfo = ref({});

// 获取管理员信息
const getAdminInfo = async () => {
  try {
    // 从authStore获取用户信息
    userInfo.value = authStore.user || {};
    
    // 获取系统状态
    const systemStatus = await apiAdmin.getSystemStatus();
    if (systemStatus.success) {
      systemInfo.value = {
        ...systemInfo.value,
        ...systemStatus.system
      };
    }
  } catch (error) {
    console.error('获取管理员信息失败:', error);
  } finally {
    loading.value = false;
  }
};



// 连通性测试
const testConnection = () => {
  router.push('/connectivity-test');
};

// 检查系统状态
const checkSystemStatus = async () => {
  try {
    const response = await apiHealth.check();
    if (response.success) {
      ElMessage.success('系统状态正常');
    } else {
      ElMessage.warning('系统状态异常');
    }
  } catch (error) {
    console.error('检查系统状态失败:', error);
    ElMessage.error('无法获取系统状态');
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 组件挂载时获取信息
onMounted(() => {
  getAdminInfo();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.loading-container {
  padding: 20px;
}

.dashboard-content {
  margin-top: 20px;
}

.dashboard-card {
  height: 100%;
}

.card-header {
  font-weight: bold;
}

.card-content {
  padding: 10px 0;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 70px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>