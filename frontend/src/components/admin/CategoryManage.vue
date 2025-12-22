<template>
  <el-dialog
    v-model="dialogVisible"
    title="商品分类管理"
    width="600px"
  >
    <!-- 分类列表 -->
    <div class="category-list">
      <el-button type="primary" @click="handleAddCategory">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
      
      <el-table
        :data="categories"
        border
        style="width: 100%; margin-top: 15px"
        row-key="id"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEditCategory(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              link
              :type="scope.row.status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDeleteCategory(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 分类表单对话框 -->
    <el-dialog
      v-model="categoryFormVisible"
      :title="isEditCategory ? '编辑分类' : '新增分类'"
      width="400px"
      append-to-body
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="排序权重" prop="sort">
          <el-input-number
            v-model="categoryForm.sort"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCategory" :loading="loading">
          {{ isEditCategory ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible'])

// Store
const productStore = useProductStore()

// Computed
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const categories = computed(() => productStore.categories)
const loading = computed(() => productStore.loading)

// Refs
const categoryFormVisible = ref(false)
const categoryFormRef = ref()

// Reactive data
const isEditCategory = ref(false)
const currentCategoryId = ref(null)

const categoryForm = reactive({
  name: '',
  description: '',
  sort: 0
})

const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

// Methods
const initCategoryForm = () => {
  Object.keys(categoryForm).forEach(key => {
    if (typeof categoryForm[key] === 'number') {
      categoryForm[key] = 0
    } else {
      categoryForm[key] = ''
    }
  })
}

const handleAddCategory = () => {
  isEditCategory.value = false
  currentCategoryId.value = null
  initCategoryForm()
  categoryFormVisible.value = true
}

const handleEditCategory = (row) => {
  isEditCategory.value = true
  currentCategoryId.value = row.id
  
  // 填充表单数据
  Object.keys(categoryForm).forEach(key => {
    if (row[key] !== undefined) {
      categoryForm[key] = row[key]
    }
  })
  
  categoryFormVisible.value = true
}

const handleSubmitCategory = async () => {
  if (!categoryFormRef.value) return
  
  try {
    await categoryFormRef.value.validate()
    
    let result
    if (isEditCategory.value) {
      result = await productStore.updateCategory(currentCategoryId.value, categoryForm)
    } else {
      result = await productStore.createCategory(categoryForm)
    }
    
    if (result.success) {
      ElMessage.success(result.message || (isEditCategory.value ? '更新成功' : '创建成功'))
      categoryFormVisible.value = false
    }
  } catch (error) {
    console.error('提交分类失败:', error)
  }
}

const handleToggleStatus = async (row) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}分类"${row.name}"吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    const result = await productStore.updateCategory(row.id, { ...row, status: newStatus })
    
    if (result.success) {
      ElMessage.success(`${action}成功`)
    }
  } catch (error) {
    // 用户取消操作
  }
}

const handleDeleteCategory = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${row.name}"吗？删除后不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await productStore.deleteCategory(row.id)
    
    if (result.success) {
      ElMessage.success('删除成功')
    }
  } catch (error) {
    // 用户取消操作
  }
}
</script>

<style scoped>
.category-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>