<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑商品' : '新增商品'"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      :disabled="loading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入商品名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品分类" prop="categoryId">
            <el-select
              v-model="form.categoryId"
              placeholder="请选择商品分类"
              style="width: 100%"
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="商品描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          rows="3"
          placeholder="请输入商品描述"
        />
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="商品价格" prop="price">
            <el-input-number
              v-model="form.price"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所需积分" prop="pointsRequired">
            <el-input-number
              v-model="form.pointsRequired"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="库存数量" prop="stock">
            <el-input-number
              v-model="form.stock"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预警库存" prop="warningStock">
            <el-input-number
              v-model="form.warningStock"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="商品图片" prop="images">
        <div class="image-upload-container">
          <div class="image-list">
            <div
              v-for="(image, index) in form.images"
              :key="index"
              class="image-item"
            >
              <img :src="image.url" class="uploaded-image" />
              <div v-if="index === primaryImageIndex" class="primary-image-mark">主图</div>
              <div class="image-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="setPrimaryImage(index)"
                  :disabled="index === primaryImageIndex"
                >
                  {{ index === primaryImageIndex ? '主图' : '设为主图' }}
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="removeImage(index)"
                >
                  删除
                </el-button>
              </div>
            </div>
            <div class="image-uploader-wrapper">
              <el-upload
                class="image-uploader"
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :before-upload="beforeImageUpload"
                name="image"
              >
                <el-icon class="image-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">支持jpg、png格式，大小不超过5MB，最多5张图片</div>
            </div>
          </div>
        </div>
      </el-form-item>
      
      <el-divider content-position="left">商品规格</el-divider>
      
      <el-form-item label="规格信息">
        <div class="specifications">
          <div
            v-for="(spec, index) in specifications"
            :key="index"
            class="spec-item"
          >
            <el-input
              v-model="spec.key"
              placeholder="规格名称"
              style="width: 120px; margin-right: 10px"
            />
            <el-input
              v-model="spec.value"
              placeholder="规格值"
              style="width: 180px; margin-right: 10px"
            />
            <el-button
              type="danger"
              size="small"
              @click="removeSpecification(index)"
            >
              删除
            </el-button>
          </div>
          <el-button
            type="primary"
            size="small"
            @click="addSpecification"
          >
            添加规格
          </el-button>
        </div>
      </el-form-item>
      
      <el-divider content-position="left">兑换规则</el-divider>
      
      <el-form-item label="兑换规则" prop="exchangeRules">
        <el-input
          v-model="form.exchangeRules"
          type="textarea"
          rows="3"
          placeholder="请输入兑换规则，如：每人限兑1个"
        />
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序权重" prop="sort">
            <el-input-number
              v-model="form.sort"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="active">上架</el-radio>
              <el-radio label="inactive">下架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/product'
import { apiAdminProduct } from '@/api/product'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible', 'success'])

// Stores
const authStore = useAuthStore()
const productStore = useProductStore()

// Refs
const formRef = ref()

// Computed
const loading = computed(() => productStore.loading)
const categories = computed(() => productStore.categories)
const uploadUrl = computed(() => '/api/admin/products/upload-image')
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}))

// Reactive data
const form = reactive({
  name: '',
  description: '',
  price: 0,
  pointsRequired: 0,
  stock: 0,
  warningStock: 10,
  categoryId: '',
  images: [],
  exchangeRules: '',
  sort: 0,
  status: 'active'
})

const primaryImageIndex = ref(0)

const specifications = ref([
  { key: '', value: '' }
])

const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
  ],
  pointsRequired: [
    { required: true, message: '请输入所需积分', trigger: 'blur' },
    { type: 'number', min: 0, message: '积分不能小于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能小于0', trigger: 'blur' }
  ]
}

// Methods
const initForm = () => {
  if (props.isEdit && props.product) {
    // 编辑模式，填充表单数据
    Object.keys(form).forEach(key => {
      if (props.product[key] !== undefined) {
        if (key === 'images') {
          // 处理图片数组
          if (props.product[key] && Array.isArray(props.product[key])) {
            form[key] = props.product[key].map((img, index) => ({
              url: img,
              isPrimary: index === 0
            }))
            primaryImageIndex.value = 0
          } else {
            form[key] = []
            primaryImageIndex.value = 0
          }
        } else {
          form[key] = props.product[key]
        }
      }
    })
    
    // 处理规格信息
    if (props.product.specifications) {
      try {
        const specs = typeof props.product.specifications === 'string' 
          ? JSON.parse(props.product.specifications) 
          : props.product.specifications
          
        specifications.value = Object.keys(specs).length > 0
          ? Object.entries(specs).map(([key, value]) => ({ key, value }))
          : [{ key: '', value: '' }]
      } catch (e) {
        console.error('解析规格信息失败:', e)
        specifications.value = [{ key: '', value: '' }]
      }
    }
  } else {
    // 新增模式，重置表单
    resetForm()
  }
}

const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (typeof form[key] === 'number') {
      form[key] = 0
    } else if (typeof form[key] === 'string') {
      form[key] = ''
    } else if (Array.isArray(form[key])) {
      form[key] = []
    }
  })
  form.status = 'active'
  form.warningStock = 10
  form.images = []
  primaryImageIndex.value = 0
  specifications.value = [{ key: '', value: '' }]
}

const addSpecification = () => {
  specifications.value.push({ key: '', value: '' })
}

const removeSpecification = (index) => {
  if (specifications.value.length > 1) {
    specifications.value.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一条规格信息')
  }
}

const beforeImageUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt5M = file.size / 1024 / 1024 < 5
  const maxImages = 5

  if (!isJpgOrPng) {
    ElMessage.error('只支持jpg或png格式的图片!')
    return false
  }
  
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  
  if (form.images.length >= maxImages) {
    ElMessage.error(`最多只能上传${maxImages}张图片!`)
    return false
  }
  
  return true
}

const handleUploadSuccess = (response) => {
  if (response.success) {
    // 添加到图片数组
    form.images.push({
      url: response.data.url,
      isPrimary: form.images.length === 0 // 第一张图默认为主图
    })
    
    // 如果是第一张图片，设置为主图
    if (form.images.length === 1) {
      primaryImageIndex.value = 0
    }
    
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

const removeImage = (index) => {
  form.images.splice(index, 1)
  
  // 如果删除的是主图，重新设置主图
  if (index === primaryImageIndex.value && form.images.length > 0) {
    primaryImageIndex.value = 0
  } else if (index < primaryImageIndex.value) {
    primaryImageIndex.value--
  } else if (form.images.length === 0) {
    primaryImageIndex.value = 0
  }
}

const setPrimaryImage = (index) => {
  primaryImageIndex.value = index
  ElMessage.success('主图设置成功')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 处理规格信息
    const specs = {}
    specifications.value.forEach(spec => {
      if (spec.key && spec.value) {
        specs[spec.key] = spec.value
      }
    })
    
    // 处理图片数组 - 只保留URL，并按照主图顺序排序
    const sortedImages = [...form.images]
    if (sortedImages.length > 0) {
      // 将主图移到第一位
      const primaryImage = sortedImages.splice(primaryImageIndex.value, 1)[0]
      sortedImages.unshift(primaryImage)
    }
    
    const imageUrls = sortedImages.map(img => img.url)
    
    const submitData = {
      ...form,
      images: imageUrls,
      specifications: specs
    }
    
    let result
    if (props.isEdit) {
      result = await productStore.updateProduct(props.product.id, submitData)
    } else {
      result = await productStore.createProduct(submitData)
    }
    
    if (result.success) {
      ElMessage.success(result.message || props.isEdit ? '更新成功' : '创建成功')
      emit('success')
      handleClose()
    }
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

// Watch
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initForm()
  }
})

// Lifecycle
onMounted(() => {
  if (categories.value.length === 0) {
    productStore.fetchCategories()
  }
})
</script>

<style scoped>
.image-upload-container {
  width: 100%;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 150px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.uploaded-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  display: block;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  padding: 5px;
  display: flex;
  justify-content: space-between;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-actions .el-button {
  padding: 2px 5px;
  font-size: 12px;
}

.image-uploader-wrapper {
  display: flex;
  flex-direction: column;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: 0.2s;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}

.image-uploader:hover {
  border-color: #409EFF;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  line-height: 150px;
  text-align: center;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  width: 150px;
}

.spec-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.primary-image-mark {
  position: absolute;
  top: 0;
  left: 0;
  background: #409EFF;
  color: white;
  font-size: 12px;
  padding: 2px 5px;
  border-radius: 0 0 6px 0;
}
</style>