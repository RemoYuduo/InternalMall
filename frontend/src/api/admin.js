import api from './index'

// 管理员相关API接口
export const apiAdmin = {
  // 管理员登录
  login: (username, password) => api.post('/admin/login', {
    username,
    password
  }),
  
  // 获取系统状态
  getSystemStatus: () => api.get('/admin/system-status'),
  
  // 商品管理相关
  products: {
    // 获取商品列表
    getList: (params) => api.get('/admin/products', { params }),
    
    // 获取商品详情
    getDetail: (id) => api.get(`/admin/products/${id}`),
    
    // 创建商品
    create: (data) => api.post('/admin/products', data),
    
    // 更新商品
    update: (id, data) => api.put(`/admin/products/${id}`, data),
    
    // 删除商品
    delete: (id) => api.delete(`/admin/products/${id}`),
    
    // 更新商品状态
    updateStatus: (id, status) => api.put(`/admin/products/${id}/status`, { status }),
    
    // 更新商品库存
    updateStock: (id, stock) => api.put(`/admin/products/${id}/stock`, { stock }),
    
    // 批量导入商品
    import: (formData) => api.post('/admin/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    
    // 导出商品
    export: (params) => api.get('/admin/products/export', { 
      params,
      responseType: 'blob'
    })
  },
  
  // 分类管理相关
  categories: {
    // 获取分类列表
    getList: () => api.get('/admin/categories'),
    
    // 创建分类
    create: (data) => api.post('/admin/categories', data),
    
    // 更新分类
    update: (id, data) => api.put(`/admin/categories/${id}`, data),
    
    // 删除分类
    delete: (id) => api.delete(`/admin/categories/${id}`)
  },
  
  // 订单管理相关
  orders: {
    // 获取订单列表
    getList: (params) => api.get('/admin/orders', { params }),
    
    // 获取订单详情
    getDetail: (id) => api.get(`/admin/orders/${id}`),
    
    // 更新订单状态
    updateStatus: (id, status, remark) => api.put(`/admin/orders/${id}/status`, { status, remark })
  },
  
  // 用户管理相关
  users: {
    // 获取用户列表
    getList: (params) => api.get('/admin/users', { params }),
    
    // 获取用户详情
    getDetail: (id) => api.get(`/admin/users/${id}`),
    
    // 调整用户积分
    updatePoints: (id, data) => api.put(`/admin/users/${id}/points`, data),
    
    // 更新用户状态
    updateStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status })
  },
  
  // 系统设置相关
  settings: {
    // 获取系统设置
    get: () => api.get('/admin/settings'),
    
    // 更新系统设置
    update: (data) => api.put('/admin/settings', data)
  },
  
  // 统计报表相关
  statistics: {
    // 获取销售统计
    getSales: (params) => api.get('/admin/statistics/sales', { params }),
    
    // 获取用户统计
    getUsers: (params) => api.get('/admin/statistics/users', { params }),
    
    // 获取商品统计
    getProducts: (params) => api.get('/admin/statistics/products', { params })
  },
  
  // 文件上传
  upload: (formData) => api.post('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default apiAdmin