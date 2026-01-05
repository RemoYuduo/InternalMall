<template>
  <div class="product-detail-container">
    <div v-if="loading" class="loading-container">
      <el-skeleton animated />
    </div>
    
    <div v-else-if="!product" class="error-container">
      <el-result
        icon="warning"
        title="商品不存在"
        sub-title="您访问的商品可能已下架或不存在"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回商品列表</el-button>
        </template>
      </el-result>
    </div>
    
    <div v-else class="product-detail">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/products' }">商品浏览</el-breadcrumb-item>
          <el-breadcrumb-item v-if="product.category">
            {{ product.category.name }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <div class="detail-content">
        <!-- 左侧图片展示 -->
        <div class="product-images">
          <el-carousel
            :autoplay="false"
            indicator-position="outside"
            :height="imageCarouselHeight"
            v-if="product.images && product.images.length > 0"
          >
            <el-carousel-item v-for="(image, index) in product.images" :key="index">
              <el-image
                :src="image"
                :alt="`${product.name} - 图片${index + 1}`"
                fit="contain"
                class="carousel-image"
                :preview-src-list="product.images"
                :initial-index="index"
              />
            </el-carousel-item>
          </el-carousel>
          
          <div v-else class="no-image">
            <el-icon><Picture /></el-icon>
            <span>暂无商品图片</span>
          </div>
        </div>
        
        <!-- 右侧商品信息 -->
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-category" v-if="product.category">
            <el-tag type="info">{{ product.category.name }}</el-tag>
          </div>
          
          <div class="product-points-info">
            <div class="points-main">
              <span class="points-label">兑换所需积分</span>
              <span class="points-value">{{ product.pointsRequired }}</span>
            </div>
            <div class="stock-info" :class="stockStatus.class">
              <el-icon><component :is="stockStatus.icon" /></el-icon>
              <span>{{ stockStatus.text }}</span>
            </div>
          </div>
          
          <div class="product-stats">
            <div class="stat-item">
              <el-icon><View /></el-icon>
              <span>浏览量: {{ product.views || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><ShoppingCart /></el-icon>
              <span>已兑换: {{ product.sales || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>收藏: {{ product.favorites || 0 }}</span>
            </div>
          </div>
          
          <!-- 数量选择 -->
          <div class="product-quantity">
            <span class="quantity-label">数量：</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock || 1"
              size="large"
              :disabled="product.stock <= 0"
            ></el-input-number>
          </div>
          
          <div class="product-actions">
            <el-button
              type="primary"
              size="large"
              :disabled="product.stock <= 0"
              @click="handleExchange"
            >
              立即兑换
            </el-button>
            <el-button
              size="large"
              @click="handleAddToCart"
              :disabled="product.stock <= 0"
            >
              加入购物车
            </el-button>
            <el-button
              size="large"
              @click="toggleFavorite"
            >
              <el-icon>
                <StarFilled v-if="product.isFavorite" />
                <Star v-else />
              </el-icon>
              {{ product.isFavorite ? '已收藏' : '收藏' }}
            </el-button>
          </div>
          
          <!-- 商品规格参数 -->
          <div v-if="productSpecs.length > 0" class="product-specs">
            <div class="specs-title">规格参数</div>
            <div class="specs-list">
              <div
                v-for="spec in productSpecs"
                :key="spec.name"
                class="spec-item"
              >
                <span class="spec-name">{{ spec.name }}</span>
                <span class="spec-value">{{ spec.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 商品详情描述 -->
      <div class="product-description">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="description">
            <div class="description-content">
              <div v-if="product.description" class="description-text">
                {{ product.description }}
              </div>
              <div v-else class="no-description">
                暂无详细描述
              </div>
              
              <div v-if="product.exchangeRules" class="exchange-rules">
                <h4>兑换规则</h4>
                <div class="rules-content">{{ product.exchangeRules }}</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, View, ShoppingCart, Star, StarFilled, Goods, CircleCheckFilled } from '@element-plus/icons-vue'
import { useUserProductStore } from '@/stores/userProduct'
import { useAuthStore } from '@/stores/auth'
import { addProductToCart } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const productStore = useUserProductStore()

// 状态
const activeTab = ref('description')
const quantity = ref(1)

// 计算属性
const loading = computed(() => productStore.loading)
const product = computed(() => productStore.currentProduct)

const imageCarouselHeight = computed(() => {
  return window.innerWidth > 768 ? '400px' : '300px'
})

const productSpecs = computed(() => {
  if (!product.value || !product.value.specifications) {
    return []
  }
  
  try {
    return typeof product.value.specifications === 'string'
      ? JSON.parse(product.value.specifications)
      : product.value.specifications
  } catch (error) {
    console.error('解析商品规格失败:', error)
    return []
  }
})

const stockStatus = computed(() => {
  const stock = product.value?.stock || 0
  
  if (stock === 0) {
    return {
      text: '已售罄',
      class: 'out-of-stock',
      icon: 'CircleCloseFilled'
    }
  } else if (stock <= 10) {
    return {
      text: `仅剩${stock}件`,
      class: 'low-stock',
      icon: 'WarningFilled'
    }
  } else {
    return {
      text: '有货',
      class: 'in-stock',
      icon: 'CircleCheckFilled'
    }
  }
})

// 方法
const fetchProductDetail = async () => {
  const productId = route.params.id
  if (!productId) {
    router.push('/products')
    return
  }
  
  await productStore.fetchProductDetail(productId)
  
  if (!productStore.currentProduct) {
    ElMessage.error('获取商品详情失败')
    router.push('/products')
  }
}

const goBack = () => {
  router.push('/products')
}

const toggleFavorite = async () => {
  if (!product.value) return
  
  const result = await productStore.toggleFavorite(product.value)
  if (result.success) {
    ElMessage.success(product.value.isFavorite ? '收藏成功' : '已取消收藏')
  } else {
    ElMessage.error(result.message || '操作失败')
  }
}

const handleExchange = () => {
  // TODO: 实现商品兑换功能
  ElMessage.info('商品兑换功能开发中...')
}

// 添加到购物车
const handleAddToCart = () => {
  if (!product.value) return
  
  // 检查用户是否已登录
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再添加商品到购物车')
    router.push('/login')
    return
  }
  
  addProductToCart(product.value.id, quantity.value).then(success => {
    if (success) {
      ElMessage.success('商品已加入购物车')
    }
  })
}

// 生命周期
onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container {
  padding: 40px 0;
}

.error-container {
  padding: 40px 0;
}

.breadcrumb-container {
  margin-bottom: 20px;
}

.detail-content {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.product-images {
  flex: 1;
  min-width: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.product-category {
  margin-bottom: 20px;
}

.product-points-info {
  background-color: #fdf6ec;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #f0d8a8;
}

.points-main {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}

.points-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

.points-value {
  font-size: 32px;
  font-weight: 700;
  color: #f56c6c;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.stock-info.in-stock {
  color: #67c23a;
}

.stock-info.low-stock {
  color: #e6a23c;
}

.stock-info.out-of-stock {
  color: #f56c6c;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.product-quantity {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.quantity-label {
  margin-right: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.product-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
}

.product-specs {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.specs-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.specs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spec-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f5f7fa;
}

.spec-name {
  flex: 1;
  color: #606266;
}

.spec-value {
  flex: 2;
  color: #303133;
}

.product-description {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.description-content {
  padding: 20px 0;
}

.description-text {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 30px;
}

.no-description {
  font-size: 16px;
  color: #909399;
  text-align: center;
  padding: 40px 0;
}

.exchange-rules {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.exchange-rules h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.rules-content {
  line-height: 1.6;
  color: #606266;
}

.carousel-image {
  width: 100%;
  height: 100%;
}

.no-image {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #c0c4cc;
  font-size: 40px;
}

.no-image span {
  margin-top: 12px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .detail-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .product-name {
    font-size: 20px;
  }
  
  .points-value {
    font-size: 28px;
  }
  
  .product-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .specs-list {
    gap: 8px;
  }
}
</style>