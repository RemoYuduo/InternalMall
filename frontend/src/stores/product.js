import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiAdminProduct } from '@/api/product'

export const useProductStore = defineStore('product', () => {
  // 状态
  const products = ref([])
  const categories = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  // 过滤条件
  const filters = ref({
    status: '',
    categoryId: '',
    keyword: ''
  })
  
  // 排序条件
  const sort = ref({
    prop: '',
    order: ''
  })
  
  // 计算属性
  const activeProducts = computed(() => 
    products.value.filter(product => product.status === 'active')
  )
  
  const inactiveProducts = computed(() => 
    products.value.filter(product => product.status === 'inactive')
  )
  
  const productsByCategory = computed(() => {
    const result = {}
    products.value.forEach(product => {
      const categoryId = product.categoryId
      if (!result[categoryId]) {
        result[categoryId] = []
      }
      result[categoryId].push(product)
    })
    return result
  })
  
  const categoryName = computed(() => (categoryId) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    return category ? category.name : '未分类'
  })
  
  // 方法
  // 获取商品列表
  const fetchProducts = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const queryParams = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        status: filters.value.status,
        category: filters.value.categoryId,
        keyword: filters.value.keyword,
        ...params
      }
      
      const response = await apiAdminProduct.getAdminProducts(queryParams)
      
      if (response.success) {
        products.value = response.data.products
        pagination.value = response.data.pagination
      } else {
        error.value = response.message || '获取商品列表失败'
      }
    } catch (err) {
      error.value = err.message || '网络请求失败'
      console.error('获取商品列表失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  // 获取商品详情
  const fetchProductDetail = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiAdminProduct.getAdminProductDetail(id)
      
      if (response.success) {
        currentProduct.value = response.data
      } else {
        error.value = response.message || '获取商品详情失败'
      }
    } catch (err) {
      error.value = err.message || '网络请求失败'
      console.error('获取商品详情失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  // 创建商品
  const createProduct = async (productData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiAdminProduct.createProduct(productData)
      
      if (response.success) {
        // 刷新商品列表
        await fetchProducts()
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '创建商品失败'
        return { success: false, message: response.message }
      }
    } catch (err) {
      error.value = err.message || '网络请求失败'
      console.error('创建商品失败:', err)
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // 更新商品
  const updateProduct = async (id, productData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiAdminProduct.updateProduct(id, productData)
      
      if (response.success) {
        // 更新列表中的商品
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index] = { ...products.value[index], ...response.data }
        }
        
        // 如果当前编辑的是这个商品，也更新
        if (currentProduct.value && currentProduct.value.id === id) {
          currentProduct.value = { ...currentProduct.value, ...response.data }
        }
        
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '更新商品失败'
        return { success: false, message: response.message }
      }
    } catch (err) {
      error.value = err.message || '网络请求失败'
      console.error('更新商品失败:', err)
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // 删除商品
  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiAdminProduct.deleteProduct(id)
      
      if (response.success) {
        // 重新获取商品列表，确保数据同步
        await fetchProducts()
        
        // 如果当前编辑的是这个商品，清空
        if (currentProduct.value && currentProduct.value.id === id) {
          currentProduct.value = null
        }
        
        return { success: true, message: '商品删除成功' }
      } else {
        error.value = response.message || '删除商品失败'
        return { success: false, message: response.message }
      }
    } catch (err) {
      error.value = err.message || '网络请求失败'
      console.error('删除商品失败:', err)
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // 更新商品状态
  const updateProductStatus = async (id, status) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiAdminProduct.updateProductStatus(id, status)
      
      if (response.success) {
        // 更新列表中的商品状态
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index].status = status
        }
        
        // 如果当前编辑的是这个商品，也更新
        if (currentProduct.value && currentProduct.value.id === id) {
          currentProduct.value.status = status
        }
        
        return { success: true, message: `商品${status === 'active' ? '上架' : '下架'}成功` }
      } else {
        error.value = response.message || '更新商品状态失败'
        return { success: false, message: response.message }
      }
    } catch (err) {
      error.value = err.message || '网络请求失败'
      console.error('更新商品状态失败:', err)
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // 更新商品库存
  const updateProductStock = async (id, stock) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiAdminProduct.updateProductStock(id, stock)
      
      if (response.success) {
        // 更新列表中的商品库存
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index].stock = stock
        }
        
        // 如果当前编辑的是这个商品，也更新
        if (currentProduct.value && currentProduct.value.id === id) {
          currentProduct.value.stock = stock
        }
        
        return { success: true, message: '库存更新成功' }
      } else {
        error.value = response.message || '更新库存失败'
        return { success: false, message: response.message }
      }
    } catch (err) {
      error.value = err.message || '网络请求失败'
      console.error('更新库存失败:', err)
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // 获取商品分类
  const fetchCategories = async () => {
    try {
      const response = await apiAdminProduct.getAdminCategories()
      
      if (response.success) {
        categories.value = response.data
      } else {
        error.value = response.message || '获取分类列表失败'
      }
    } catch (err) {
      error.value = err.message || '网络请求失败'
      console.error('获取分类列表失败:', err)
    }
  }
  
  // 创建分类
  const createCategory = async (categoryData) => {
    try {
      const response = await apiAdminProduct.createCategory(categoryData)
      
      if (response.success) {
        // 刷新分类列表
        await fetchCategories()
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      console.error('创建分类失败:', err)
      return { success: false, message: err.message }
    }
  }
  
  // 更新分类
  const updateCategory = async (id, categoryData) => {
    try {
      const response = await apiAdminProduct.updateCategory(id, categoryData)
      
      if (response.success) {
        // 更新列表中的分类
        const index = categories.value.findIndex(c => c.id === id)
        if (index !== -1) {
          categories.value[index] = { ...categories.value[index], ...response.data }
        }
        
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      console.error('更新分类失败:', err)
      return { success: false, message: err.message }
    }
  }
  
  // 删除分类
  const deleteCategory = async (id) => {
    try {
      const response = await apiAdminProduct.deleteCategory(id)
      
      if (response.success) {
        // 从列表中移除分类
        categories.value = categories.value.filter(c => c.id !== id)
        return { success: true, message: '分类删除成功' }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      console.error('删除分类失败:', err)
      return { success: false, message: err.message }
    }
  }
  
  // 重置状态
  const resetState = () => {
    products.value = []
    categories.value = []
    currentProduct.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
    filters.value = {
      status: '',
      categoryId: '',
      keyword: ''
    }
    sort.value = {
      prop: '',
      order: ''
    }
  }
  
  return {
    // 状态
    products,
    categories,
    currentProduct,
    loading,
    error,
    pagination,
    filters,
    sort,
    
    // 计算属性
    activeProducts,
    inactiveProducts,
    productsByCategory,
    categoryName,
    
    // 方法
    fetchProducts,
    fetchProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    updateProductStock,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    resetState
  }
})