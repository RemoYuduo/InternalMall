const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

// 商品列表 - 公开接口
router.get('/', ProductController.getProducts);

// 商品搜索 - 公开接口
router.get('/search', ProductController.searchProducts);

// 商品分类 - 公开接口
router.get('/categories', ProductController.getCategories);

// 用户收藏商品 - 需要登录
router.get('/favorites', authenticateToken, ProductController.getFavorites);

// 商品详情 - 公开接口
router.get('/:id', ProductController.getProductById);

// 添加/取消收藏 - 需要登录
router.post('/:id/favorite', authenticateToken, ProductController.toggleFavorite);
router.delete('/:id/favorite', authenticateToken, ProductController.toggleFavorite);

module.exports = router;