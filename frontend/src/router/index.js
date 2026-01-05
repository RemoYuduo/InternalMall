import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/product/ProductBrowseView.vue')
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('@/views/product/ProductDetailView.vue')
    },
    {
      path: '/connectivity-test',
      name: 'connectivity-test',
      component: () => import('@/views/ConnectivityTest.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/user/profile',
      name: 'user-profile',
      component: () => import('@/views/user/ProfileView.vue')
    },
    {
      path: '/user/favorites',
      name: 'user-favorites',
      component: () => import('@/views/user/FavoritesView.vue')
    },
    {
      path: '/user/cart',
      name: 'user-cart',
      component: () => import('@/views/user/CartView.vue')
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/DashboardView.vue')
    },
    {
      path: '/admin/products',
      name: 'admin-products',
      component: () => import('@/views/admin/ProductManageView.vue')
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: () => import('@/views/admin/OrderManageView.vue')
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/UserManageView.vue')
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: () => import('@/views/admin/SystemSettingsView.vue')
    }
  ]
})

export default router