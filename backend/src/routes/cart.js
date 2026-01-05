const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CartController = require('../controllers/cartController');

// 获取用户购物车列表
router.get('/', authenticateToken, CartController.getCart);

// 添加商品到购物车
router.post('/', authenticateToken, CartController.addToCart);

// 获取购物车统计信息
router.get('/summary', authenticateToken, CartController.getCartSummary);

// 获取选中的购物车商品（用于下单）
router.get('/selected', authenticateToken, CartController.getSelectedItems);

// 批量更新购物车商品选中状态
router.put('/batch-update-selection', authenticateToken, CartController.updateMultipleSelectedStatus);

// 批量删除购物车商品
router.delete('/batch-remove', authenticateToken, CartController.batchRemoveFromCart);

// 清空购物车
router.delete('/clear', authenticateToken, CartController.clearCart);

// 更新购物车商品数量
router.put('/:cartId', authenticateToken, CartController.updateQuantity);

// 更新购物车商品选中状态
router.put('/:cartId/selection', authenticateToken, CartController.updateSelectedStatus);

// 删除购物车商品
router.delete('/:cartId', authenticateToken, CartController.removeFromCart);

module.exports = router;