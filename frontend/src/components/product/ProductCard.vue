<template>
  <div class="product-card" @click="$emit('click')">
    <div class="product-image-container">
      <el-image
        :src="productImage"
        :alt="product.name"
        class="product-image"
        fit="cover"
        lazy
      >
        <template #error>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      
      <!-- 收藏按钮 -->
      <div class="favorite-button" @click.stop="toggleFavorite">
        <el-icon :class="{ 'is-favorite': product.isFavorite }">
          <StarFilled v-if="product.isFavorite" />
          <Star v-else />
        </el-icon>
      </div>
      
      <!-- 库存状态标签 -->
      <div class="stock-tag" :class="stockStatus.class">
        {{ stockStatus.text }}
      </div>
    </div>
    
    <div class="product-info">
      <div class="product-name" :title="product.name">{{ product.name }}</div>
      <div class="product-category">{{ categoryName }}</div>
      <div class="product-points">
        <span class="points-label">积分</span>
        <span class="points-value">{{ product.pointsRequired }}</span>
      </div>
      <div class="product-stats">
        <span class="stat-item">
          <el-icon><View /></el-icon>
          {{ product.views || 0 }}
        </span>
        <span class="stat-item">
          <el-icon><ShoppingCart /></el-icon>
          {{ product.sales || 0 }}
        </span>
      </div>
      <div class="product-actions">
        <el-button 
          type="primary" 
          size="small" 
          @click.stop="addToCart"
          :disabled="product.stock <= 0"
        >
          加入购物车
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Star, StarFilled, View, ShoppingCart, Picture } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'favorite', 'addToCart'])

const productStore = useProductStore()

// 计算商品图片URL
const productImage = computed(() => {
  if (props.product.images && props.product.images.length > 0) {
    const image = props.product.images[0]
    // 确保URL是完整的
    if (image.startsWith('http') || image.startsWith('/')) {
      return image
    }
    return `/${image}`
  }
  return ''
})

// 计算分类名称
const categoryName = computed(() => {
  if (props.product.category) {
    return props.product.category.name
  }
  return '未分类'
})

// 计算库存状态
const stockStatus = computed(() => {
  const stock = props.product.stock || 0
  if (stock === 0) {
    return { text: '已售罄', class: 'out-of-stock' }
  } else if (stock <= 10) {
    return { text: '仅剩' + stock + '件', class: 'low-stock' }
  } else {
    return { text: '有货', class: 'in-stock' }
  }
})

// 切换收藏状态
const toggleFavorite = () => {
  emit('favorite', props.product)
}

// 加入购物车
const addToCart = () => {
  emit('addToCart', props.product)
}
</script>

<style scoped>
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #c0c4cc;
  font-size: 40px;
}

.favorite-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1;
}

.favorite-button:hover {
  background-color: rgba(255, 255, 255, 1);
}

.favorite-button .el-icon {
  font-size: 18px;
  color: #909399;
  transition: color 0.3s;
}

.favorite-button .is-favorite {
  color: #f56c6c;
}

.stock-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  font-weight: 500;
  z-index: 1;
}

.stock-tag.in-stock {
  background-color: #67c23a;
}

.stock-tag.low-stock {
  background-color: #e6a23c;
}

.stock-tag.out-of-stock {
  background-color: #f56c6c;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-category {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}

.product-points {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
}

.points-label {
  font-size: 12px;
  color: #909399;
  margin-right: 6px;
}

.points-value {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-actions {
  margin-top: 12px;
}

@media (max-width: 768px) {
  .product-image-container {
    height: 160px;
  }
  
  .product-info {
    padding: 12px;
  }
  
  .product-name {
    font-size: 14px;
  }
  
  .points-value {
    font-size: 18px;
  }
  
  .favorite-button {
    width: 30px;
    height: 30px;
  }
  
  .favorite-button .el-icon {
    font-size: 16px;
  }
}
</style>