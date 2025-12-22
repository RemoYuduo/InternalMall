<template>
  <AdminLayout>
    <div class="system-settings">
      <h2>系统设置</h2>
      <el-card>
        <div class="placeholder">
          <p>系统设置功能正在开发中...</p>
        </div>
      </el-card>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>

<style scoped>
.system-settings {
  padding: 20px;
}

.placeholder {
  text-align: center;
  padding: 50px 0;
  color: #999;
}
</style>