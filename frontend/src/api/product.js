import api from './index'

// 商品相关API接口
export const apiProduct = {
  // 获取商品分类
  getCategories: () => api.get('/products/categories'),
  
  // 获取商品列表
  getProducts: (params) => api.get('/products', { params }),
  
  // 获取商品详情
  getProductDetail: (id) => api.get(`/products/${id}`),
  
  // 商品搜索
  searchProducts: (params) => api.get('/products/search', { params }),
  
  // 商品收藏
  addFavorite: (id) => api.post(`/products/${id}/favorite`),
  
  // 取消收藏
  removeFavorite: (id) => api.delete(`/products/${id}/favorite`),
  
  // 获取收藏商品
  getFavorites: (params) => api.get('/products/favorites', { params })
}

// 管理员商品管理API接口
export const apiAdminProduct = {
  // 获取商品列表（管理员）
  getAdminProducts: (params) => api.get('/admin/products', { params }),
  
  // 获取商品详情（管理员）
  getAdminProductDetail: (id) => api.get(`/admin/products/${id}`),
  
  // 创建商品
  createProduct: (data) => api.post('/admin/products', data),
  
  // 更新商品
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  
  // 删除商品
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // 商品上下架
  updateProductStatus: (id, status) => api.put(`/admin/products/${id}/status`, { status }),
  
  // 更新商品库存
  updateProductStock: (id, stock) => api.put(`/admin/products/${id}/stock`, { stock }),
  
  // 批量导入商品
  importProducts: (formData) => api.post('/admin/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // 导出商品
  exportProducts: (params) => api.get('/admin/products/export', { 
    params,
    responseType: 'blob'
  }),
  
  // 获取分类列表（管理员）
  getAdminCategories: () => api.get('/admin/categories'),
  
  // 创建分类
  createCategory: (data) => api.post('/admin/categories', data),
  
  // 更新分类
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  
  // 删除分类
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // 上传商品图片
  uploadProductImage: (formData) => api.post('/admin/products/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default {
  ...apiProduct,
  ...apiAdminProduct
}