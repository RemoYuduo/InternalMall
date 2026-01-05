<template>
  <div class="product-list">
    <!-- 搜索和过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="商品名称">
          <el-input
            v-model="filters.keyword"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="商品分类">
          <el-select
            v-model="filters.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品状态">
          <el-select
            v-model="filters.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="已上架" value="active" />
            <el-option label="已下架" value="inactive" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 操作按钮区域 -->
    <el-card class="action-card">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
      <el-button type="success" @click="handleImport">
        <el-icon><Upload /></el-icon>
        批量导入
      </el-button>
      <el-button type="warning" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出商品
      </el-button>
    </el-card>
    
    <!-- 商品列表表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="products"
        stripe
        border
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column label="商品图片" width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.images && scope.row.images.length > 0"
              :src="scope.row.images[0].url || scope.row.images[0]"
              :preview-src-list="scope.row.images.map(img => img.url || img)"
              fit="cover"
              style="width: 60px; height: 60px"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="image-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="商品名称" min-width="150" />
        
        <el-table-column prop="category" label="分类" width="100">
          <template #default="scope">
            {{ scope.row.category?.name || '未分类' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="price" label="价格(元)" width="100">
          <template #default="scope">
            ¥{{ scope.row.price?.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="pointsRequired" label="所需积分" width="100" />
        
        <el-table-column prop="stock" label="库存" width="80" />
        
        <el-table-column prop="sales" label="销量" width="80" sortable="custom" />
        
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              link
              :type="scope.row.status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-button
              link
              type="info"
              size="small"
              @click="handleAdjustStock(scope.row)"
            >
              调整库存
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 调整库存对话框 -->
    <el-dialog
      v-model="stockDialogVisible"
      title="调整库存"
      width="400px"
    >
      <el-form :model="stockForm" :rules="stockRules" ref="stockFormRef">
        <el-form-item label="当前库存">
          <el-input v-model="stockForm.currentStock" disabled />
        </el-form-item>
        <el-form-item label="新库存" prop="stock">
          <el-input-number
            v-model="stockForm.stock"
            :min="0"
            :max="99999"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmStock" :loading="loading">
          确定
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 商品导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入商品"
      width="500px"
    >
      <div class="import-tips">
        <p>请按照模板格式上传Excel文件，支持.xlsx格式</p>
        <el-link type="primary" @click="handleDownloadTemplate">下载导入模板</el-link>
      </div>
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传xlsx/xls文件，且不超过10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmImport" :loading="loading">
          导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Upload, Download, Picture, UploadFilled } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import { apiAdminProduct } from '@/api/product'

// Store
const productStore = useProductStore()

// 响应式数据
const loading = computed(() => productStore.loading)
const products = computed(() => productStore.products)
const categories = computed(() => productStore.categories)
const pagination = computed(() => productStore.pagination)

const filters = reactive({
  keyword: '',
  categoryId: '',
  status: ''
})

const stockDialogVisible = ref(false)
const importDialogVisible = ref(false)
const stockFormRef = ref()
const uploadRef = ref()

const stockForm = reactive({
  id: null,
  currentStock: 0,
  stock: 0
})

const stockRules = {
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能小于0', trigger: 'blur' }
  ]
}

// 方法
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getImageUrl = (image) => {
  if (!image) return ''
  
  // 如果是对象，获取URL属性
  const url = typeof image === 'object' ? image.url : image
  
  // 直接返回后端提供的完整URL
  return url
}

const handleSearch = () => {
  productStore.filters = { ...filters }
  productStore.fetchProducts()
}

const handleReset = () => {
  Object.assign(filters, {
    keyword: '',
    categoryId: '',
    status: ''
  })
  productStore.filters = { ...filters }
  productStore.fetchProducts()
}

const handleSortChange = ({ prop, order }) => {
  productStore.sort = { prop, order }
  productStore.fetchProducts()
}

const handleSizeChange = (size) => {
  productStore.pagination.limit = size
  productStore.fetchProducts()
}

const handleCurrentChange = (page) => {
  productStore.pagination.page = page
  productStore.fetchProducts()
}

const handleAdd = () => {
  // 跳转到新增商品页面
  emit('add')
}

const handleEdit = (row) => {
  // 跳转到编辑商品页面
  emit('edit', row)
}

const handleToggleStatus = async (row) => {
  const action = row.status === 'active' ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定要${action}商品"${row.name}"吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    const result = await productStore.updateProductStatus(row.id, newStatus)
    
    if (result.success) {
      ElMessage.success(result.message)
    }
  } catch (error) {
    // 用户取消操作
  }
}

const handleAdjustStock = (row) => {
  stockForm.id = row.id
  stockForm.currentStock = row.stock
  stockForm.stock = row.stock
  stockDialogVisible.value = true
}

const handleConfirmStock = async () => {
  if (!stockFormRef.value) return
  
  try {
    await stockFormRef.value.validate()
    const result = await productStore.updateProductStock(stockForm.id, stockForm.stock)
    
    if (result.success) {
      ElMessage.success(result.message)
      stockDialogVisible.value = false
    }
  } catch (error) {
    console.error('调整库存失败:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${row.name}"吗？删除后不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await productStore.deleteProduct(row.id)
    
    if (result.success) {
      ElMessage.success(result.message)
    }
  } catch (error) {
    // 用户取消操作
  }
}

const handleImport = () => {
  importDialogVisible.value = true
}

const handleExport = async () => {
  try {
    const response = await apiAdminProduct.exportProducts(filters)
    
    // 创建下载链接
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `商品列表_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const handleDownloadTemplate = () => {
  // 下载导入模板
  ElMessage.info('模板下载功能开发中')
}

const handleConfirmImport = async () => {
  if (!uploadRef.value) return
  
  const file = uploadRef.value.uploadFiles[0]
  if (!file) {
    ElMessage.warning('请选择要导入的文件')
    return
  }
  
  const formData = new FormData()
  formData.append('file', file.raw)
  
  try {
    await apiAdminProduct.importProducts(formData)
    ElMessage.success('导入成功')
    importDialogVisible.value = false
    productStore.fetchProducts()
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
}

// 事件定义
const emit = defineEmits(['add', 'edit'])

// 生命周期
onMounted(() => {
  productStore.fetchCategories()
  productStore.fetchProducts()
})
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.filter-card,
.action-card,
.table-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.import-tips {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style>