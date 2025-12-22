<template>
  <div class="product-browse-container">
    <div class="browse-header">
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
      <div class="header-actions">
        <div class="sort-section">
          <el-select v-model="currentSort" placeholder="排序方式" @change="handleSortChange">
            <el-option label="最新上架" value="created_desc" />
            <el-option label="最早上架" value="created_asc" />
            <el-option label="积分从低到高" value="points_asc" />
            <el-option label="积分从高到低" value="points_desc" />
            <el-option label="销量从高到低" value="sales_desc" />
            <el-option label="销量从低到高" value="sales_asc" />
          </el-select>
        </div>
        <el-button type="primary" plain @click="goToCart">
          <el-icon><ShoppingCart /></el-icon>
          我的购物车
        </el-button>
        <el-button type="primary" plain @click="goToFavorites">
          <el-icon><Star /></el-icon>
          我的收藏
        </el-button>
      </div>
    </div>

    <div class="browse-content">
      <!-- 左侧分类导航 -->
      <div class="category-sidebar">
        <div class="category-title">商品分类</div>
        <div class="category-list">
          <div 
            class="category-item"
            :class="{ active: selectedCategoryId === null }"
            @click="selectCategory(null)"
          >
            <span>全部商品</span>
            <span class="count">{{ productCount }}</span>
          </div>
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ active: selectedCategoryId === category.id }"
            @click="selectCategory(category.id)"
          >
            <span>{{ category.name }}</span>
            <span class="count">{{ category.count || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧商品列表 -->
      <div class="product-main">
        <div class="product-breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品浏览</el-breadcrumb-item>
            <el-breadcrumb-item v-if="selectedCategory">
              {{ selectedCategory.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="6" animated />
        </div>
        
        <div v-else-if="products.length === 0" class="empty-container">
          <el-empty description="暂无商品" />
        </div>
        
        <div v-else class="product-grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @click="goToProductDetail(product.id)"
            @favorite="toggleFavorite(product)"
            @addToCart="addToCartFromBrowse(product)"
          />
        </div>

        <!-- 分页 -->
        <div v-if="products.length > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :page-sizes="[12, 24, 48]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, ShoppingCart } from '@element-plus/icons-vue'
import { useUserProductStore } from '@/stores/userProduct'
import { useAuthStore } from '@/stores/auth'
import { addProductToCart } from '@/stores/cart'
import ProductCard from '@/components/product/ProductCard.vue'

const router = useRouter()
const productStore = useUserProductStore()

// 状态
const searchQuery = ref('')
const selectedCategoryId = ref(null)
const currentSort = ref('created_desc')

// 计算属性
const loading = computed(() => productStore.loading)
const products = computed(() => productStore.productsWithFavoriteStatus)
const categories = computed(() => productStore.categories)
const pagination = computed(() => productStore.pagination)

const selectedCategory = computed(() => {
  return categories.value.find(cat => cat.id === selectedCategoryId.value)
})

const productCount = computed(() => {
  return pagination.value.total
})

// 方法
const fetchProducts = async () => {
  const params = {
    sort: currentSort.value
  }
  
  if (selectedCategoryId.value) {
    params.category = selectedCategoryId.value
  }
  
  if (searchQuery.value) {
    params.keyword = searchQuery.value
  }
  
  await productStore.fetchProducts(params)
}

const fetchCategories = async () => {
  await productStore.fetchCategories()
}

const handleSearch = () => {
  productStore.pagination.page = 1
  fetchProducts()
}

const handleSortChange = () => {
  productStore.pagination.page = 1
  fetchProducts()
}

const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId
  productStore.pagination.page = 1
  fetchProducts()
}

const handleSizeChange = (size) => {
  productStore.pagination.limit = size
  productStore.pagination.page = 1
  fetchProducts()
}

const handleCurrentChange = (page) => {
  productStore.pagination.page = page
  fetchProducts()
}

const goToProductDetail = (productId) => {
  router.push(`/products/${productId}`)
}

const toggleFavorite = async (product) => {
  const result = await productStore.toggleFavorite(product)
  if (result.success) {
    ElMessage.success(product.isFavorite ? '收藏成功' : '已取消收藏')
  } else {
    ElMessage.error(result.message || '操作失败')
  }
}

const addToCartFromBrowse = (product) => {
  // 检查用户是否已登录
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再添加商品到购物车')
    router.push('/login')
    return
  }
  
  addProductToCart(product.id, 1).then(success => {
    if (success) {
      ElMessage.success('商品已加入购物车')
    }
  })
}

const goToFavorites = () => {
  router.push('/user/favorites')
}

const goToCart = () => {
  router.push('/user/cart')
}

// 监听器
watch(selectedCategoryId, () => {
  productStore.pagination.page = 1
  fetchProducts()
})

// 生命周期
onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
})
</script>

<style scoped>
.product-browse-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.browse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.search-section {
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sort-section {
  width: 180px;
}

.browse-content {
  display: flex;
  gap: 20px;
}

.category-sidebar {
  width: 240px;
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:hover {
  background-color: #f5f7fa;
}

.category-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.count {
  font-size: 12px;
  color: #909399;
  background-color: #f4f4f5;
  padding: 2px 6px;
  border-radius: 10px;
}

.product-main {
  flex: 1;
  min-width: 0;
}

.product-breadcrumb {
  margin-bottom: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.loading-container, .empty-container {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .browse-content {
    flex-direction: column;
  }
  
  .category-sidebar {
    width: 100%;
  }
  
  .browse-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    max-width: none;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
  
  .sort-section {
    width: 100%;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}
</style>