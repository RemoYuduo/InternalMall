import request from './index';

/**
 * 获取用户购物车列表
 */
export function getCart() {
  return request({
    url: '/cart',
    method: 'get'
  });
}

/**
 * 添加商品到购物车
 * @param {Object} data - { productId, quantity }
 */
export function addToCart(data) {
  return request({
    url: '/cart',
    method: 'post',
    data
  });
}

/**
 * 更新购物车商品数量
 * @param {Number} cartId - 购物车项ID
 * @param {Object} data - { quantity }
 */
export function updateCartQuantity(cartId, data) {
  return request({
    url: `/cart/${cartId}`,
    method: 'put',
    data
  });
}

/**
 * 更新购物车商品选中状态
 * @param {Number} cartId - 购物车项ID
 * @param {Object} data - { isSelected }
 */
export function updateCartSelection(cartId, data) {
  return request({
    url: `/cart/${cartId}/selection`,
    method: 'put',
    data
  });
}

/**
 * 批量更新购物车商品选中状态
 * @param {Object} data - { cartIds, isSelected }
 */
export function batchUpdateCartSelection(data) {
  return request({
    url: '/cart/batch-update-selection',
    method: 'put',
    data
  });
}

/**
 * 删除购物车商品
 * @param {Number} cartId - 购物车项ID
 */
export function removeFromCart(cartId) {
  return request({
    url: `/cart/${cartId}`,
    method: 'delete'
  });
}

/**
 * 批量删除购物车商品
 * @param {Object} data - { cartIds }
 */
export function batchRemoveFromCart(data) {
  return request({
    url: '/cart/batch-remove',
    method: 'delete',
    data
  });
}

/**
 * 清空购物车
 */
export function clearCart() {
  return request({
    url: '/cart/clear',
    method: 'delete'
  });
}

/**
 * 获取购物车统计信息
 */
export function getCartSummary() {
  return request({
    url: '/cart/summary',
    method: 'get'
  });
}

/**
 * 获取选中的购物车商品（用于下单）
 */
export function getSelectedItems() {
  return request({
    url: '/cart/selected',
    method: 'get'
  });
}