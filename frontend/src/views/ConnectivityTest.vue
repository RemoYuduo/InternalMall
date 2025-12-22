<template>
  <div class="page-container">
    <div class="card-container">
      <h1 class="page-title">服务连通性测试</h1>
      <p class="section-title">测试前后端API接口连通性</p>
      
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 基础连通性测试 -->
        <el-tab-pane label="基础连通性" name="basic">
          <div style="margin-bottom: 20px;">
            <el-button 
              type="primary" 
              @click="testBasicConnectivity" 
              :loading="loading.basic"
            >
              测试基础连通性
            </el-button>
          </div>
          
          <div v-if="result.basic" class="test-result">
            <el-alert
              :title="result.basic.success ? '连接成功' : '连接失败'"
              :type="result.basic.success ? 'success' : 'error'"
              :description="result.basic.message"
              show-icon
              :closable="false"
            />
            
            <div v-if="result.basic.data" style="margin-top: 20px;">
              <h4>响应数据:</h4>
              <el-scrollbar height="200px">
                <pre>{{ JSON.stringify(result.basic.data, null, 2) }}</pre>
              </el-scrollbar>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 数据库连通性测试 -->
        <el-tab-pane label="数据库连通性" name="database">
          <div style="margin-bottom: 20px;">
            <el-button 
              type="primary" 
              @click="testDatabaseConnectivity" 
              :loading="loading.database"
            >
              测试数据库连通性
            </el-button>
          </div>
          
          <div v-if="result.database" class="test-result">
            <el-alert
              :title="result.database.success ? '数据库连接成功' : '数据库连接失败'"
              :type="result.database.success ? 'success' : 'error'"
              :description="result.database.message"
              show-icon
              :closable="false"
            />
            
            <div v-if="result.database.data" style="margin-top: 20px;">
              <h4>数据库表信息:</h4>
              <el-table :data="formatTableData(result.database.data.tables)" style="width: 100%">
                <el-table-column prop="table" label="表名" />
                <el-table-column prop="count" label="记录数" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 用户登录测试 -->
        <el-tab-pane label="用户登录" name="login">
          <div style="margin-bottom: 20px;">
            <el-form :model="loginForm" label-width="80px">
              <el-form-item label="用户名">
                <el-input v-model="loginForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
              </el-form-item>
              <el-form-item label="用户类型">
                <el-select v-model="loginForm.type" placeholder="请选择用户类型">
                  <el-option label="普通用户" value="user" />
                  <el-option label="管理员" value="admin" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="testUserLogin" 
                  :loading="loading.login"
                >
                  测试登录
                </el-button>
                <el-button @click="fillTestCredentials">填充测试账号</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div v-if="result.login" class="test-result">
            <el-alert
              :title="result.login.success ? '登录成功' : '登录失败'"
              :type="result.login.success ? 'success' : 'error'"
              :description="result.login.message"
              show-icon
              :closable="false"
            />
            
            <div v-if="result.login.data" style="margin-top: 20px;">
              <h4>登录响应:</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="用户ID">{{ result.login.data.userId }}</el-descriptions-item>
                <el-descriptions-item label="用户类型">{{ result.login.data.userType }}</el-descriptions-item>
                <el-descriptions-item label="Token">{{ result.login.data.token ? '已获取' : '未获取' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 用户接口测试 -->
        <el-tab-pane label="用户接口" name="user" :disabled="!isUserLoggedIn">
          <div style="margin-bottom: 20px;">
            <el-alert
              title="请先登录后测试用户接口"
              type="info"
              show-icon
              :closable="false"
              v-if="!isUserLoggedIn"
            />
            <el-button 
              v-else
              type="primary" 
              @click="testUserAPI" 
              :loading="loading.user"
            >
              测试用户接口
            </el-button>
          </div>
          
          <div v-if="result.user" class="test-result">
            <el-alert
              :title="result.user.success ? '用户接口测试成功' : '用户接口测试失败'"
              :type="result.user.success ? 'success' : 'error'"
              :description="result.user.message"
              show-icon
              :closable="false"
            />
            
            <div v-if="result.user.data" style="margin-top: 20px;">
              <h4>用户信息:</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="ID">{{ result.user.data.id }}</el-descriptions-item>
                <el-descriptions-item label="用户名">{{ result.user.data.username }}</el-descriptions-item>
                <el-descriptions-item label="积分">{{ result.user.data.points }}</el-descriptions-item>
                <el-descriptions-item label="角色">{{ result.user.data.role }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 管理员接口测试 -->
        <el-tab-pane label="管理员接口" name="admin" :disabled="!isAdminLoggedIn">
          <div style="margin-bottom: 20px;">
            <el-alert
              title="请先以管理员身份登录后测试管理员接口"
              type="info"
              show-icon
              :closable="false"
              v-if="!isAdminLoggedIn"
            />
            <div v-else>
              <el-button 
                type="primary" 
                @click="testAdminAPI" 
                :loading="loading.admin"
                style="margin-right: 10px;"
              >
                测试管理员接口
              </el-button>
              <el-button 
                type="primary" 
                @click="testSystemStatus" 
                :loading="loading.system"
              >
                测试系统状态
              </el-button>
            </div>
          </div>
          
          <div v-if="result.admin" class="test-result">
            <el-alert
              :title="result.admin.success ? '管理员接口测试成功' : '管理员接口测试失败'"
              :type="result.admin.success ? 'success' : 'error'"
              :description="result.admin.message"
              show-icon
              :closable="false"
            />
          </div>
          
          <div v-if="result.system" class="test-result">
            <el-alert
              :title="result.system.success ? '系统状态获取成功' : '系统状态获取失败'"
              :type="result.system.success ? 'success' : 'error'"
              :description="result.system.message"
              show-icon
              :closable="false"
            />
            
            <div v-if="result.system.data" style="margin-top: 20px;">
              <h4>系统状态:</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="状态">{{ result.system.data.system.status }}</el-descriptions-item>
                <el-descriptions-item label="版本">{{ result.system.data.system.version }}</el-descriptions-item>
                <el-descriptions-item label="管理员">{{ result.system.data.admin }}</el-descriptions-item>
                <el-descriptions-item label="时间">{{ result.system.data.system.timestamp }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 测试商品接口 -->
        <el-tab-pane label="测试商品接口" name="products" :disabled="!isUserLoggedIn">
          <div style="margin-bottom: 20px;">
            <el-alert
              title="请先登录后测试商品接口"
              type="info"
              show-icon
              :closable="false"
              v-if="!isUserLoggedIn"
            />
            <el-button 
              v-else
              type="primary" 
              @click="testProductsAPI" 
              :loading="loading.products"
            >
              测试商品接口
            </el-button>
          </div>
          
          <div v-if="result.products" class="test-result">
            <el-alert
              :title="result.products.success ? '商品接口测试成功' : '商品接口测试失败'"
              :type="result.products.success ? 'success' : 'error'"
              :description="result.products.message"
              show-icon
              :closable="false"
            />
            
            <div v-if="result.products.data && result.products.data.products" style="margin-top: 20px;">
              <h4>测试商品列表:</h4>
              <el-table :data="result.products.data.products" style="width: 100%">
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column prop="name" label="商品名称" />
                <el-table-column prop="pointsRequired" label="所需积分" width="120" />
                <el-table-column prop="stock" label="库存" width="80" />
                <el-table-column prop="status" label="状态" width="80" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <div style="margin-top: 30px;">
        <el-button @click="$router.push('/')">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { apiHealth, apiAuth, apiUser, apiAdmin } from '@/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 当前激活的标签页
const activeTab = ref('basic')

// 加载状态
const loading = reactive({
  basic: false,
  database: false,
  login: false,
  user: false,
  admin: false,
  system: false,
  products: false
})

// 测试结果
const result = reactive({
  basic: null,
  database: null,
  login: null,
  user: null,
  admin: null,
  system: null,
  products: null
})

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  type: 'user'
})

// 计算属性
const isUserLoggedIn = computed(() => authStore.isAuthenticated)
const isAdminLoggedIn = computed(() => authStore.isAuthenticated && authStore.isAdmin)

// 标签页切换处理
const handleTabClick = () => {
  // 可以在切换时执行一些逻辑
}

// 测试基础连通性
const testBasicConnectivity = async () => {
  loading.basic = true
  result.basic = null
  
  try {
    const response = await apiHealth.check()
    result.basic = {
      success: true,
      message: response.message,
      data: response
    }
    ElMessage.success('基础连通性测试成功')
  } catch (error) {
    result.basic = {
      success: false,
      message: error.message || '基础连通性测试失败',
      data: null
    }
    ElMessage.error('基础连通性测试失败')
  } finally {
    loading.basic = false
  }
}

// 测试数据库连通性
const testDatabaseConnectivity = async () => {
  loading.database = true
  result.database = null
  
  try {
    const response = await apiHealth.checkDatabase()
    result.database = {
      success: true,
      message: response.message,
      data: response
    }
    ElMessage.success('数据库连通性测试成功')
  } catch (error) {
    result.database = {
      success: false,
      message: error.message || '数据库连通性测试失败',
      data: null
    }
    ElMessage.error('数据库连通性测试失败')
  } finally {
    loading.database = false
  }
}

// 测试用户登录
const testUserLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  loading.login = true
  result.login = null
  
  try {
    const response = await apiAuth.login(
      loginForm.username,
      loginForm.password,
      loginForm.type
    )
    
    // 保存登录状态
    authStore.setAuth({
      token: response.token,
      userId: response.userId,
      username: loginForm.username,
      userType: response.userType
    })
    
    result.login = {
      success: true,
      message: response.message || '登录成功',
      data: response
    }
    ElMessage.success('登录测试成功')
  } catch (error) {
    result.login = {
      success: false,
      message: error.message || '登录测试失败',
      data: null
    }
    ElMessage.error('登录测试失败')
  } finally {
    loading.login = false
  }
}

// 填充测试账号
const fillTestCredentials = () => {
  if (loginForm.type === 'user') {
    loginForm.username = 'user1'
    loginForm.password = 'password1'
  } else {
    loginForm.username = 'admin'
    loginForm.password = 'admin123'
  }
}

// 测试用户接口
const testUserAPI = async () => {
  loading.user = true
  result.user = null
  
  try {
    const response = await apiUser.getProfile()
    result.user = {
      success: true,
      message: '用户信息获取成功',
      data: response.data
    }
    ElMessage.success('用户接口测试成功')
  } catch (error) {
    result.user = {
      success: false,
      message: error.message || '用户接口测试失败',
      data: null
    }
    ElMessage.error('用户接口测试失败')
  } finally {
    loading.user = false
  }
}

// 测试管理员接口
const testAdminAPI = async () => {
  loading.admin = true
  result.admin = null
  
  try {
    const response = await apiAdmin.test()
    result.admin = {
      success: true,
      message: response.message || '管理员接口测试成功',
      data: response
    }
    ElMessage.success('管理员接口测试成功')
  } catch (error) {
    result.admin = {
      success: false,
      message: error.message || '管理员接口测试失败',
      data: null
    }
    ElMessage.error('管理员接口测试失败')
  } finally {
    loading.admin = false
  }
}

// 测试系统状态
const testSystemStatus = async () => {
  loading.system = true
  result.system = null
  
  try {
    const response = await apiAdmin.getSystemStatus()
    result.system = {
      success: true,
      message: response.message || '系统状态获取成功',
      data: response
    }
    ElMessage.success('系统状态测试成功')
  } catch (error) {
    result.system = {
      success: false,
      message: error.message || '系统状态测试失败',
      data: null
    }
    ElMessage.error('系统状态测试失败')
  } finally {
    loading.system = false
  }
}

// 测试商品接口
const testProductsAPI = async () => {
  loading.products = true
  result.products = null
  
  try {
    const response = await apiUser.getTestProducts()
    result.products = {
      success: true,
      message: '测试商品列表获取成功',
      data: response.data
    }
    ElMessage.success('商品接口测试成功')
  } catch (error) {
    result.products = {
      success: false,
      message: error.message || '商品接口测试失败',
      data: null
    }
    ElMessage.error('商品接口测试失败')
  } finally {
    loading.products = false
  }
}

// 格式化表格数据
const formatTableData = (tables) => {
  return Object.entries(tables).map(([table, count]) => ({
    table,
    count
  }))
}
</script>

<style scoped>
.test-result {
  margin-top: 20px;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>