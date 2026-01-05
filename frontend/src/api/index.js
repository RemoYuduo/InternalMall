import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const authStore = useAuthStore()
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 如果是在登录页面收到401错误，显示具体的错误消息
          if (window.location.pathname === '/login') {
            ElMessage.error(data.message || '用户名或密码错误')
          } else {
            ElMessage.error('未授权，请重新登录')
            authStore.clearAuth()
            // 重定向到登录页
            window.location.href = '/login'
          }
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(data.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// API方法
export const apiHealth = {
  // 健康检查
  check: () => api.get('/health'),
  
  // 数据库状态检查
  checkDatabase: () => api.get('/health/database')
}

export const apiAuth = {
  // 用户登录
  login: (username, password, type) => api.post('/auth/login', {
    username,
    password,
    type
  }),
  
  // 用户登出
  logout: () => api.post('/auth/logout')
}

export const apiUser = {
  // 获取用户信息
  getProfile: () => api.get('/user/profile'),
  
  // 更新用户信息
  updateProfile: (data) => api.put('/user/profile', data),
  
  // 获取测试商品列表
  getTestProducts: () => api.get('/user/test-products')
}

export const apiAdmin = {
  // 管理员连通性测试
  test: () => api.get('/admin/test'),
  
  // 获取系统状态
  getSystemStatus: () => api.get('/admin/system-status')
}

export default api