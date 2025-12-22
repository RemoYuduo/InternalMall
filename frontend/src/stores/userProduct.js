import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiProduct } from '@/api/product'

export const useUserProductStore = defineStore('userProduct', () => {
  // 状态
  const products = ref([])
  const categories = ref([])
  const currentProduct = ref(null)
  const favorites = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  
  // 过滤条件
  const filters = ref({
    category: '',
    keyword: '',
    minPoints: '',
    maxPoints: '',
    sort: 'created_desc'
  })
  
  // 计算属性
  const activeProducts = computed(() => 
    products.value.filter(product => product.status === 'active')
  )
  
  const favoriteProductIds = computed(() => 
    favorites.value.map(fav => fav.id)
  )
  
  const productsWithFavoriteStatus = computed(() => 
    products.value.map(product => ({
      ...product,
      isFavorite: favoriteProductIds.value.includes(product.id)
    }))
  )
  
  // 方法
  // 获取商品列表
  const fetchProducts = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const queryParams = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters.value,
        ...params
      }
      
      const response = await apiProduct.getProducts(queryParams)
      
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
      const response = await apiProduct.getProductDetail(id)
      
      if (response.success) {
        currentProduct.value = {
          ...response.data,
          isFavorite: favoriteProductIds.value.includes(response.data.id)
        }
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
  
  // 获取商品分类
  const fetchCategories = async () => {
    try {
      const response = await apiProduct.getCategories()
      
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
  
  // 搜索商品
  const searchProducts = async (searchParams) => {
    loading.value = true
    error.value = null
    
    try {
      const queryParams = {
        page: 1,
        limit: pagination.value.limit,
        ...searchParams
      }
      
      const response = await apiProduct.searchProducts(queryParams)
      
      if (response.success) {
        products.value = response.data.products
        pagination.value = response.data.pagination
      } else {
        error.value = response.message || '搜索商品失败'
      }
    } catch (err) {
      error.value = err.message || '网络请求失败'
      console.error('搜索商品失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  // 添加商品收藏
  const addFavorite = async (productId) => {
    try {
      const response = await apiProduct.addFavorite(productId)
      
      if (response.success) {
        // 如果有当前商品且ID匹配，更新收藏状态
        if (currentProduct.value && currentProduct.value.id === productId) {
          currentProduct.value.isFavorite = true
        }
        
        // 获取最新收藏列表
        await fetchFavorites()
        
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      console.error('添加收藏失败:', err)
      return { success: false, message: err.message }
    }
  }
  
  // 取消商品收藏
  const removeFavorite = async (productId) => {
    try {
      const response = await apiProduct.removeFavorite(productId)
      
      if (response.success) {
        // 如果有当前商品且ID匹配，更新收藏状态
        if (currentProduct.value && currentProduct.value.id === productId) {
          currentProduct.value.isFavorite = false
        }
        
        // 获取最新收藏列表
        await fetchFavorites()
        
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      console.error('取消收藏失败:', err)
      return { success: false, message: err.message }
    }
  }
  
  // 获取收藏商品列表
  const fetchFavorites = async () => {
    try {
      const response = await apiProduct.getFavorites({
        page: 1,
        limit: 100  // 获取所有收藏，避免分页问题
      })
      
      if (response.success) {
        favorites.value = response.data.products
      }
    } catch (err) {
      console.error('获取收藏列表失败:', err)
    }
  }
  
  // 切换收藏状态
  const toggleFavorite = async (product) => {
    if (product.isFavorite) {
      return await removeFavorite(product.id)
    } else {
      return await addFavorite(product.id)
    }
  }
  
  // 更新过滤条件
  const updateFilters = (newFilters) => {
    Object.assign(filters.value, newFilters)
    pagination.value.page = 1  // 重置页码
  }
  
  // 重置过滤条件
  const resetFilters = () => {
    filters.value = {
      category: '',
      keyword: '',
      minPoints: '',
      maxPoints: '',
      sort: 'created_desc'
    }
    pagination.value.page = 1
  }
  
  // 重置状态
  const resetState = () => {
    products.value = []
    categories.value = []
    currentProduct.value = null
    favorites.value = []
    loading.value = false
    error.value = null
    pagination.value = {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    }
    filters.value = {
      category: '',
      keyword: '',
      minPoints: '',
      maxPoints: '',
      sort: 'created_desc'
    }
  }
  
  return {
    // 状态
    products,
    categories,
    currentProduct,
    favorites,
    loading,
    error,
    pagination,
    filters,
    
    // 计算属性
    activeProducts,
    favoriteProductIds,
    productsWithFavoriteStatus,
    
    // 方法
    fetchProducts,
    fetchProductDetail,
    fetchCategories,
    searchProducts,
    addFavorite,
    removeFavorite,
    fetchFavorites,
    toggleFavorite,
    updateFilters,
    resetFilters,
    resetState
  }
})