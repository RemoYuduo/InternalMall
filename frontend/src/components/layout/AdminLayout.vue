<template>
  <div class="admin-layout">
    <el-container class="admin-container">
      <!-- 侧边栏 -->
      <el-aside width="250px" class="admin-aside">
        <div class="admin-logo">
          <h2>企业商城</h2>
          <p>管理后台</p>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          router
          class="admin-menu"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>仪表板</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/products">
            <el-icon><ShoppingBag /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/orders">
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="admin-header">
          <div class="header-left">
            <h3>{{ pageTitle }}</h3>
          </div>
          
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="30" :src="userAvatar || undefined">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <span class="username">{{ authStore.user?.username || '管理员' }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 主内容区域 -->
        <el-main class="admin-main">
          <slot />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { 
  HomeFilled, 
  ShoppingBag, 
  Document, 
  User, 
  Setting,
  UserFilled,
  ArrowDown
} from '@element-plus/icons-vue'

// Store
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Computed
const activeMenu = computed(() => route.path)
const userAvatar = computed(() => authStore.user?.avatar)

const pageTitle = computed(() => {
  const path = route.path
  switch (path) {
    case '/admin/dashboard':
      return '仪表板'
    case '/admin/products':
      return '商品管理'
    case '/admin/orders':
      return '订单管理'
    case '/admin/users':
      return '用户管理'
    case '/admin/settings':
      return '系统设置'
    default:
      return '管理后台'
  }
})

// Methods
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      // 跳转到个人信息页面
      router.push('/user/profile')
      break
    case 'logout':
      // 执行登出操作
      handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败')
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-container {
  height: 100%;
}

.admin-aside {
  background-color: #304156;
  color: #fff;
  overflow: hidden;
}

.admin-logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-logo h2 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #fff;
}

.admin-logo p {
  margin: 0;
  font-size: 12px;
  color: #a0a8bb;
}

.admin-menu {
  border-right: none;
}

.admin-menu .el-menu-item {
  color: #bfcbd9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.admin-menu .el-menu-item:hover,
.admin-menu .el-menu-item.is-active {
  background-color: #263445;
  color: #409EFF;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #606266;
}

.admin-main {
  background-color: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
}
</style>