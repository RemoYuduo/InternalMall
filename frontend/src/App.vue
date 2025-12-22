<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 应用根组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #606266;
}
</style>