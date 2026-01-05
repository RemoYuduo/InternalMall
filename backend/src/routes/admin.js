const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const AdminController = require('../controllers/adminController');
const { uploadSingle, uploadMultiple } = require('../utils/fileUpload');

// 管理员登录
router.post('/login', AdminController.login);

// 获取系统状态
router.get('/system-status', authenticateToken, requireAdmin, AdminController.getSystemStatus);

// 测试接口 - 管理员连通性测试
router.get('/test', authenticateToken, requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: '管理员接口连通性测试成功',
    admin: req.user.username,
    timestamp: new Date().toISOString()
  });
});

// 商品管理
router.get('/products', authenticateToken, requireAdmin, AdminController.getProducts);
router.post('/products', authenticateToken, requireAdmin, AdminController.createProduct);
router.put('/products/:id', authenticateToken, requireAdmin, AdminController.updateProduct);
router.delete('/products/:id', authenticateToken, requireAdmin, AdminController.deleteProduct);
router.put('/products/batch-status', authenticateToken, requireAdmin, AdminController.batchUpdateProductStatus);
router.delete('/products/batch', authenticateToken, requireAdmin, AdminController.batchDeleteProducts);

// 商品状态更新
router.put('/products/:id/status', authenticateToken, requireAdmin, AdminController.updateProductStatus);

// 商品库存调整
router.put('/products/:id/stock', authenticateToken, requireAdmin, AdminController.updateProductStock);

// 商品图片上传
router.post('/products/upload-image', authenticateToken, requireAdmin, uploadSingle, AdminController.uploadProductImage);
router.post('/products/upload-images', authenticateToken, requireAdmin, uploadMultiple(5), AdminController.uploadProductImages);

// 库存预警
router.get('/products/low-stock', authenticateToken, requireAdmin, AdminController.getLowStockProducts);

// 热销商品
router.get('/products/top-selling', authenticateToken, requireAdmin, AdminController.getTopSellingProducts);

// 商品分类管理
router.get('/categories', authenticateToken, requireAdmin, AdminController.getCategories);
router.post('/categories', authenticateToken, requireAdmin, AdminController.createCategory);
router.put('/categories/:id', authenticateToken, requireAdmin, AdminController.updateCategory);
router.delete('/categories/:id', authenticateToken, requireAdmin, AdminController.deleteCategory);

module.exports = router;