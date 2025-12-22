import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isUser = computed(() => user.value?.role === 'user')
  
  // 方法
  const setAuth = (authData) => {
    token.value = authData.token
    user.value = {
      id: authData.userId,
      username: authData.username,
      role: authData.userType
    }
    
    // 保存到本地存储
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(user.value))
  }
  
  const clearAuth = () => {
    token.value = ''
    user.value = null
    
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  
  return {
    // 状态
    token,
    user,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    isUser,
    
    // 方法
    setAuth,
    clearAuth
  }
})