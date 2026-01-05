<template>
  <AdminLayout>
    <div class="user-manage">
      <h2>用户管理</h2>
      <el-card>
        <div class="placeholder">
          <p>用户管理功能正在开发中...</p>
        </div>
      </el-card>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>

<style scoped>
.user-manage {
  padding: 20px;
}

.placeholder {
  text-align: center;
  padding: 50px 0;
  color: #999;
}
</style>