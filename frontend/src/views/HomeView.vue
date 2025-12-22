<template>
  <div class="page-container">
    <div class="card-container">
      <h1 class="page-title">企业内部福利商城</h1>
      <p>欢迎使用企业内部福利商城系统！</p>
      <div class="button-group">
        <el-button type="success" @click="goToUserLogin">
          用户登录
        </el-button>
        <el-button type="warning" @click="goToAdminLogin">
          管理员登录
        </el-button>
        <el-button type="primary" @click="goToProducts">
          商品浏览
        </el-button>
        <el-button type="info" @click="$router.push('/connectivity-test')">
          服务连通性测试
        </el-button>
      </div>
      <div class="account-tips">
        <p>测试账号：</p>
        <p>用户账号：user1/password1, user2/password2, user3/password3</p>
        <p>管理员账号：admin/admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// 跳转到用户登录页面
const goToUserLogin = () => {
  router.push({
    path: '/login',
    query: { type: 'user' }
  });
};

// 跳转到管理员登录页面
const goToAdminLogin = () => {
  router.push({
    path: '/login',
    query: { type: 'admin' }
  });
};

// 跳转到商品浏览页面
const goToProducts = () => {
  router.push('/products');
};
</script>

<style scoped>
.button-group {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.account-tips {
  margin-top: 30px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.account-tips p {
  margin: 5px 0;
}
</style>