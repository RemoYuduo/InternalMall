<template>
  <AdminLayout>
    <div class="product-manage">
      <div class="header">
        <h2>商品管理</h2>
        <div class="header-actions">
          <el-button type="primary" @click="showCategoryDialog">
            <el-icon><Setting /></el-icon>
            分类管理
          </el-button>
        </div>
      </div>
    
    <!-- 商品列表 -->
    <ProductList
      @add="handleAddProduct"
      @edit="handleEditProduct"
    />
    
    <!-- 新增/编辑商品对话框 -->
    <ProductForm
      v-model:visible="productFormVisible"
      :product="currentProduct"
      :is-edit="isEditProduct"
      @success="handleProductSuccess"
    />
    
      <!-- 分类管理对话框 -->
      <CategoryManage v-model:visible="categoryDialogVisible" />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import ProductList from '@/components/admin/ProductList.vue'
import ProductForm from '@/components/admin/ProductForm.vue'
import CategoryManage from '@/components/admin/CategoryManage.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useProductStore } from '@/stores/product'

// Store
const productStore = useProductStore()

// Refs
const productFormVisible = ref(false)
const categoryDialogVisible = ref(false)
const currentProduct = ref({})
const isEditProduct = ref(false)

// Methods
const handleAddProduct = () => {
  currentProduct.value = {}
  isEditProduct.value = false
  productFormVisible.value = true
}

const handleEditProduct = (product) => {
  currentProduct.value = { ...product }
  isEditProduct.value = true
  productFormVisible.value = true
}

const handleProductSuccess = () => {
  // 刷新商品列表
  productStore.fetchProducts()
}

const showCategoryDialog = () => {
  categoryDialogVisible.value = true
}
</script>

<style scoped>
.product-manage {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>