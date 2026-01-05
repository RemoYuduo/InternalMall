const express = require('express');
const router = express.Router();
const { authenticateToken, requireUser } = require('../middleware/auth');
const { query } = require('../config/database');

// 获取用户信息
router.get('/profile', authenticateToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await query(
      'SELECT id, username, email, phone, points, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
});

// 测试接口 - 获取测试商品列表
router.get('/test-products', authenticateToken, requireUser, async (req, res) => {
  try {
    // 返回模拟商品数据用于测试
    const mockProducts = [
      {
        id: 1,
        name: '测试商品1',
        description: '这是用于测试的商品1',
        price: 10.00,
        pointsRequired: 50,
        stock: 100,
        image: '',
        status: 'active',
        category: '电子产品'
      },
      {
        id: 2,
        name: '测试商品2',
        description: '这是用于测试的商品2',
        price: 20.00,
        pointsRequired: 100,
        stock: 50,
        image: '',
        status: 'active',
        category: '办公用品'
      }
    ];
    
    res.status(200).json({
      success: true,
      data: {
        products: mockProducts,
        pagination: {
          page: 1,
          limit: 10,
          total: 2
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取测试商品列表失败',
      error: error.message
    });
  }
});

module.exports = router;