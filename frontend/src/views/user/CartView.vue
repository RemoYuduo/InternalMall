<template>
  <div class="cart-view">
    <h2 class="page-title">我的购物车</h2>
    
    <!-- 购物车为空 -->
    <div v-if="totalCount === 0" class="empty-cart">
      <div class="empty-cart-content">
        <svg-icon name="shopping-cart" size="80px" />
        <h3>购物车还是空的</h3>
        <p>快去挑选心仪的商品吧！</p>
        <el-button type="primary" @click="goToProductList">去逛逛</el-button>
      </div>
    </div>
    
    <!-- 购物车有商品 -->
    <div v-else class="cart-content">
      <!-- 全选和批量操作 -->
      <div class="cart-header">
        <div class="select-all">
          <el-checkbox 
            v-model="allSelectedComputed" 
            @change="handleSelectAllChange"
            :disabled="loading"
          >
            全选
          </el-checkbox>
          <span class="selected-count">已选择 {{ cartSummary.selectedCount }} 件</span>
        </div>
        
        <div class="batch-actions" v-if="selectedItems.length > 0">
          <el-button 
            type="danger" 
            size="small" 
            @click="handleBatchDelete"
            :disabled="loading"
          >
            删除选中
          </el-button>
        </div>
      </div>
      
      <!-- 购物车列表 -->
      <div class="cart-list" v-loading="loading">
        <div 
          v-for="item in cartItems" 
          :key="item.id"
          class="cart-item"
        >
          <!-- 选择框 -->
          <div class="item-select">
            <el-checkbox 
              v-model="item.is_selected"
              @change="handleItemSelectChange(item)"
              :disabled="loading"
            ></el-checkbox>
          </div>
          
          <!-- 商品图片 -->
          <div class="item-image">
            <el-image 
              :src="item.images && item.images.length > 0 ? item.images[0] : '/placeholder-product.jpg'"
              :preview-src-list="item.images || []"
              fit="cover"
              class="product-image"
            >
              <template #error>
                <div class="image-error">
                  <svg-icon name="image-error" size="40px" />
                </div>
              </template>
            </el-image>
          </div>
          
          <!-- 商品信息 -->
          <div class="item-info">
            <div class="product-name">{{ item.product_name }}</div>
            <div class="product-category">{{ item.category_name }}</div>
            <div class="product-points">所需积分: {{ item.points_required }}</div>
          </div>
          
          <!-- 数量调整 -->
          <div class="item-quantity">
            <el-input-number 
              v-model="item.quantity"
              :min="1"
              :max="item.stock"
              @change="handleQuantityChange(item)"
              :disabled="loading"
              size="small"
            ></el-input-number>
            <div class="stock-info">库存: {{ item.stock }}</div>
          </div>
          
          <!-- 小计 -->
          <div class="item-subtotal">
            <div class="subtotal-points">{{ item.quantity * item.points_required }} 积分</div>
          </div>
          
          <!-- 操作 -->
          <div class="item-actions">
            <el-button 
              type="danger" 
              size="small" 
              icon="Delete"
              @click="handleDeleteItem(item)"
              :disabled="loading"
              circle
            ></el-button>
          </div>
        </div>
      </div>
      
      <!-- 购物车底部 -->
      <div class="cart-footer">
        <div class="footer-left">
          <el-button 
            type="text" 
            @click="handleClearCart"
            :disabled="loading"
          >
            清空购物车
          </el-button>
        </div>
        
        <div class="footer-right">
          <div class="total-info">
            <div class="selected-count">已选 {{ cartSummary.selectedCount }} 件商品</div>
            <div class="total-points">合计: {{ cartSummary.totalPoints }} 积分</div>
          </div>
          
          <el-button 
            type="primary" 
            size="large"
            @click="goToCheckout"
            :disabled="cartSummary.selectedCount === 0 || loading"
          >
            去结算
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { 
  cartItems, 
  cartSummary, 
  loading, 
  totalCount, 
  selectedItems,
  allSelected,
  fetchCart,
  updateQuantity,
  updateSelection,
  batchUpdateSelection,
  removeItem,
  removeSelectedItems,
  clearCartItems
} from '@/stores/cart';

const router = useRouter();

// 计算属性
const allSelectedComputed = {
  get() {
    return allSelected.value;
  },
  set(value) {
    batchUpdateSelection(value).then(success => {
      if (success) {
        ElMessage.success(value ? '已全选' : '已取消全选');
      }
    });
  }
};

// 初始化
onMounted(() => {
  // 检查用户是否已登录
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  fetchCart();
});

// 处理全选变化
const handleSelectAllChange = (value) => {
  batchUpdateSelection(value).then(success => {
    if (success) {
      ElMessage.success(value ? '已全选' : '已取消全选');
    }
  });
};

// 处理单个商品选中变化
const handleItemSelectChange = (item) => {
  updateSelection(item.id, item.is_selected).then(success => {
    if (success) {
      ElMessage.success(item.is_selected ? '已选中' : '已取消选中');
    }
  });
};

// 处理数量变化
const handleQuantityChange = (item) => {
  updateQuantity(item.id, item.quantity).then(success => {
    if (success) {
      ElMessage.success('数量已更新');
    }
  });
};

// 删除单个商品
const handleDeleteItem = (item) => {
  ElMessageBox.confirm(
    `确定要删除 ${item.product_name} 吗？`,
    '删除商品',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    removeItem(item.id).then(success => {
      if (success) {
        ElMessage.success('商品已删除');
      }
    });
  });
};

// 批量删除选中的商品
const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedItems.value.length} 件商品吗？`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    removeSelectedItems().then(success => {
      if (success) {
        ElMessage.success('商品已删除');
      }
    });
  });
};

// 清空购物车
const handleClearCart = () => {
  ElMessageBox.confirm(
    '确定要清空购物车吗？此操作不可恢复',
    '清空购物车',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    clearCartItems().then(success => {
      if (success) {
        ElMessage.success('购物车已清空');
      }
    });
  });
};

// 跳转到商品列表
const goToProductList = () => {
  router.push('/products');
};

// 跳转到结算页面
const goToCheckout = () => {
  router.push('/checkout');
};
</script>

<style scoped>
.cart-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

/* 空购物车样式 */
.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.empty-cart-content {
  text-align: center;
  padding: 40px;
}

.empty-cart-content h3 {
  margin: 20px 0 12px;
  font-size: 18px;
  color: #606266;
}

.empty-cart-content p {
  margin: 0 0 24px;
  color: #909399;
}

/* 购物车内容样式 */
.cart-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}

.select-all {
  display: flex;
  align-items: center;
}

.selected-count {
  margin-left: 10px;
  color: #909399;
  font-size: 14px;
}

/* 购物车列表样式 */
.cart-list {
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-select {
  padding-right: 16px;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 16px;
}

.product-image {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  margin-right: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-category {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.product-points {
  color: #e6a23c;
  font-size: 14px;
  font-weight: 600;
}

.item-quantity {
  width: 120px;
  margin-right: 16px;
  text-align: center;
}

.stock-info {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.item-subtotal {
  width: 120px;
  text-align: right;
  margin-right: 16px;
}

.subtotal-points {
  color: #e6a23c;
  font-size: 16px;
  font-weight: 600;
}

.item-actions {
  width: 40px;
}

/* 购物车底部样式 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.footer-right {
  display: flex;
  align-items: center;
}

.total-info {
  margin-right: 20px;
  text-align: right;
}

.selected-count {
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
}

.total-points {
  color: #e6a23c;
  font-size: 18px;
  font-weight: 600;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
    padding: 16px;
  }
  
  .item-image {
    width: 60px;
    height: 60px;
    margin-right: 12px;
  }
  
  .item-info {
    width: calc(100% - 120px);
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .item-quantity {
    width: 100px;
    margin-right: 12px;
  }
  
  .item-subtotal {
    width: 100px;
    margin-right: 12px;
  }
  
  .item-actions {
    position: absolute;
    right: 16px;
    top: 16px;
  }
  
  .cart-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .footer-right {
    width: 100%;
    justify-content: space-between;
    margin-top: 16px;
  }
  
  .total-info {
    margin-right: 0;
  }
}
</style>