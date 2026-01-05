const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// 健康检查接口
router.get('/', async (req, res) => {
  try {
    // 检查数据库连接
    const dbCheck = await query('SELECT 1 as test');
    
    res.status(200).json({
      success: true,
      message: '服务运行正常',
      timestamp: new Date().toISOString(),
      database: 'connected',
      services: {
        api: 'running',
        database: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务异常',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      services: {
        api: 'running',
        database: 'disconnected'
      },
      error: error.message
    });
  }
});

// 数据库状态检查
router.get('/database', async (req, res) => {
  try {
    const tables = await query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    const tableCounts = {};
    
    for (const table of tables) {
      const count = await query(`SELECT COUNT(*) as count FROM ${table.name}`);
      tableCounts[table.name] = count[0].count;
    }
    
    res.status(200).json({
      success: true,
      message: '数据库状态正常',
      tables: tableCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '数据库检查失败',
      error: error.message
    });
  }
});

module.exports = router;