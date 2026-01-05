<template>
  <div class="page-container">
    <!-- 用户导航菜单 -->
    <div class="user-nav">
      <div class="nav-card">
        <div class="nav-title">功能导航</div>
        <div class="nav-list">
          <router-link to="/products" class="nav-item">
            <el-icon><Shop /></el-icon>
            <span>商品浏览</span>
          </router-link>
          <router-link to="/user/cart" class="nav-item">
            <el-icon><ShoppingCart /></el-icon>
            <span>我的购物车</span>
          </router-link>
          <router-link to="/user/favorites" class="nav-item">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </router-link>
          <router-link to="/user/profile" class="nav-item active">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <div class="card-container">
      <div class="page-header">
        <h1 class="page-title">用户个人资料</h1>
        <el-button type="danger" @click="handleLogout" :loading="logoutLoading">
          退出登录
        </el-button>
      </div>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else class="profile-content">
        <el-descriptions title="基本信息" :column="1" border>
          <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userInfo.email || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="手机">{{ userInfo.phone || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="积分">{{ userInfo.points }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ userInfo.role === 'user' ? '普通用户' : '管理员' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDate(userInfo.created_at) }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="action-buttons">
          <el-button type="primary" @click="showEditDialog = true">
            编辑资料
          </el-button>
          <el-button @click="$router.push('/')">
            返回首页
          </el-button>
        </div>
      </div>
      
      <!-- 编辑资料对话框 -->
      <el-dialog 
        v-model="showEditDialog" 
        title="编辑个人资料" 
        width="400px"
        :before-close="handleCloseEditDialog"
      >
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="phone">
            <el-input v-model="editForm.phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleCloseEditDialog">取消</el-button>
            <el-button type="primary" @click="handleUpdateProfile" :loading="updateLoading">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Shop, Star, User, ShoppingCart } from '@element-plus/icons-vue';
import { apiUser, apiAuth } from '@/api';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// 加载状态
const loading = ref(true);
const logoutLoading = ref(false);
const updateLoading = ref(false);

// 用户信息
const userInfo = ref({});

// 编辑对话框
const showEditDialog = ref(false);
const editFormRef = ref(null);

// 编辑表单
const editForm = ref({
  email: '',
  phone: ''
});

// 表单验证规则
const editRules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
};

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await apiUser.getProfile();
    if (response.success) {
      userInfo.value = response.data;
      editForm.value = {
        email: response.data.email || '',
        phone: response.data.phone || ''
      };
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理登出
const handleLogout = async () => {
  logoutLoading.value = true;
  try {
    await apiAuth.logout();
    ElMessage.success('已成功退出登录');
  } catch (error) {
    console.error('登出请求失败:', error);
    ElMessage.warning('已清除本地登录信息');
  } finally {
    logoutLoading.value = false;
    authStore.clearAuth();
    router.push('/');
  }
};

// 关闭编辑对话框
const handleCloseEditDialog = () => {
  showEditDialog.value = false;
  // 重置表单数据
  editForm.value = {
    email: userInfo.value.email || '',
    phone: userInfo.value.phone || ''
  };
};

// 更新个人资料
const handleUpdateProfile = async () => {
  if (!editFormRef.value) return;
  
  const valid = await editFormRef.value.validate().catch(() => false);
  if (!valid) return;
  
  updateLoading.value = true;
  
  try {
    const response = await apiUser.updateProfile(editForm.value);
    if (response.success) {
      ElMessage.success('个人资料更新成功');
      userInfo.value = { ...userInfo.value, ...response.data };
      showEditDialog.value = false;
    }
  } catch (error) {
    console.error('更新个人资料失败:', error);
  } finally {
    updateLoading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 组件挂载时获取用户信息
onMounted(() => {
  getUserInfo();
});
</script>

<style scoped>
.user-nav {
  margin-bottom: 20px;
}

.nav-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.nav-list {
  display: flex;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 6px;
  text-decoration: none;
  color: #606266;
  transition: all 0.3s;
}

.nav-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.nav-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.loading-container {
  padding: 20px;
}

.profile-content {
  margin-top: 20px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .nav-list {
    flex-direction: column;
    gap: 8px;
  }
  
  .nav-item {
    padding: 12px 16px;
  }
}
</style>