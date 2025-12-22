<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">{{ pageTitle }}</h1>
        <div class="login-type-toggle">
          <el-button 
            :type="loginType === 'user' ? 'primary' : 'default'"
            @click="switchLoginType('user')"
          >
            用户登录
          </el-button>
          <el-button 
            :type="loginType === 'admin' ? 'primary' : 'default'"
            @click="switchLoginType('admin')"
          >
            管理员登录
          </el-button>
        </div>
      </div>

      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            @keyup.enter="handleLogin"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="test-account-tips" v-if="showTestAccounts">
        <p>测试账号：</p>
        <div v-if="loginType === 'user'">
          <p>user1/password1 (100积分)</p>
          <p>user2/password2 (200积分)</p>
          <p>user3/password3 (150积分)</p>
        </div>
        <div v-else>
          <p>admin/admin123</p>
        </div>
        <el-button 
          size="small" 
          type="text" 
          @click="fillTestAccount"
        >
          快速填充测试账号
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { apiAuth } from '@/api';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 表单引用
const loginFormRef = ref(null);
// 加载状态
const loading = ref(false);
// 是否显示测试账号
const showTestAccounts = ref(true);

// 登录类型，默认从URL参数获取，否则默认为user
const loginType = ref(route.query.type || 'user');

// 页面标题
const pageTitle = computed(() => {
  return loginType.value === 'admin' ? '管理员登录' : '用户登录';
});

// 登录表单
const loginForm = ref({
  username: '',
  password: ''
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
};

// 切换登录类型
const switchLoginType = (type) => {
  loginType.value = type;
  loginForm.value = { username: '', password: '' };
  // 更新URL参数但不触发路由变化
  router.replace({ query: { type } });
};

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  // 表单验证
  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) return;
  
  loading.value = true;
  
  try {
    const response = await apiAuth.login(
      loginForm.value.username,
      loginForm.value.password,
      loginType.value
    );
    
    if (response.success) {
      // 保存认证信息
      authStore.setAuth({
        token: response.token,
        userId: response.userId,
        username: loginForm.value.username,
        userType: response.userType
      });
      
      ElMessage.success(response.message || '登录成功');
      
      // 根据用户类型跳转到不同页面
      if (response.userType === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/products');
      }
    }
  } catch (error) {
    // 错误已在API拦截器中处理，这里可以添加额外的错误处理
    console.error('登录失败:', error);
    
    // 如果是网络错误或拦截器未处理的错误，显示通用错误提示
    if (!error.response) {
      ElMessage.error('登录失败，请检查网络连接');
    }
  } finally {
    loading.value = false;
  }
};

// 填充测试账号
const fillTestAccount = () => {
  if (loginType.value === 'user') {
    loginForm.value.username = 'user1';
    loginForm.value.password = 'password1';
  } else {
    loginForm.value.username = 'admin';
    loginForm.value.password = 'admin123';
  }
};

// 组件挂载时处理
onMounted(() => {
  // 如果URL中没有type参数，设置为默认值
  if (!route.query.type) {
    router.replace({ query: { type: loginType.value } });
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.login-type-toggle {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  height: 40px;
}

.test-account-tips {
  margin-top: 25px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.test-account-tips p {
  margin: 5px 0;
}
</style>