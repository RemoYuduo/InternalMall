const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const config = require('../config/app');
const { query } = require('../config/database');

// 用户登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  body('type').isIn(['user', 'admin']).withMessage('用户类型必须是user或admin')
], async (req, res) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误',
        errors: errors.array()
      });
    }

    const { username, password, type } = req.body;

    // 查询用户
    const user = await query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 检查用户类型是否匹配
    if (user[0].role !== type) {
      return res.status(403).json({
        success: false,
        message: '用户类型不匹配'
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { 
        id: user[0].id, 
        username: user[0].username, 
        role: user[0].role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(200).json({
      success: true,
      message: '登录成功',
      token,
      userType: user[0].role,
      userId: user[0].id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 用户登出
router.post('/logout', (req, res) => {
  // 在JWT方案中，服务端不需要做特殊处理
  // 客户端删除token即可实现登出
  res.status(200).json({
    success: true,
    message: '登出成功'
  });
});

module.exports = router;