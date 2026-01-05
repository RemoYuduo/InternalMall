<template>
  <div class="favorites-container">
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
          <router-link to="/user/favorites" class="nav-item active">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </router-link>
          <router-link to="/user/profile" class="nav-item">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <div class="favorites-content">
      <div class="favorites-header">
        <h2>我的收藏</h2>
        <div class="header-actions">
          <el-button @click="goToProducts">继续浏览商品</el-button>
        </div>
      </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="4" animated />
    </div>
    
    <div v-else-if="favorites.length === 0" class="empty-container">
      <el-empty description="暂无收藏商品">
        <el-button type="primary" @click="goToProducts">去浏览商品</el-button>
      </el-empty>
    </div>
    
    <div v-else class="favorites-content">
      <div class="products-grid">
        <ProductCard
          v-for="product in favorites"
          :key="product.id"
          :product="{ ...product, isFavorite: true }"
          @click="goToProductDetail(product.id)"
          @favorite="toggleFavorite(product)"
          @addToCart="addToCartFromFavorites(product)"
        />
      </div>
      
      <!-- 分页 -->
      <div v-if="pagination.total > pagination.limit" class="pagination-container">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Shop, Star, User, ShoppingCart } from '@element-plus/icons-vue'
import { useUserProductStore } from '@/stores/userProduct'
import { addProductToCart } from '@/stores/cart'
import ProductCard from '@/components/product/ProductCard.vue'

const router = useRouter()
const productStore = useUserProductStore()

// 计算属性
const loading = computed(() => productStore.loading)
const favorites = computed(() => productStore.favorites)
const pagination = computed(() => productStore.pagination)

// 方法
const fetchFavorites = async () => {
  await productStore.fetchFavorites()
}

const goToProducts = () => {
  router.push('/products')
}

const goToProductDetail = (productId) => {
  router.push(`/products/${productId}`)
}

const toggleFavorite = async (product) => {
  const result = await productStore.toggleFavorite(product)
  if (result.success) {
    ElMessage.success('已取消收藏')
    // 重新获取收藏列表
    await fetchFavorites()
  } else {
    ElMessage.error(result.message || '操作失败')
  }
}

const addToCartFromFavorites = (product) => {
  addProductToCart(product.id, 1).then(success => {
    if (success) {
      ElMessage.success('商品已加入购物车')
    }
  })
}

const handleSizeChange = (size) => {
  // 由于收藏API可能不支持分页大小修改，这里重新获取数据
  productStore.pagination.limit = size
  productStore.pagination.page = 1
  fetchFavorites()
}

const handleCurrentChange = (page) => {
  // 由于收藏API可能不支持分页，这里重新获取数据
  productStore.pagination.page = page
  fetchFavorites()
}

// 生命周期
onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
.favorites-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

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

.favorites-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.favorites-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.loading-container, .empty-container {
  padding: 40px 0;
}

.products-grid {
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

@media (max-width: 768px) {
  .nav-list {
    flex-direction: column;
    gap: 8px;
  }
  
  .nav-item {
    padding: 12px 16px;
  }
  
  .favorites-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}
</style>