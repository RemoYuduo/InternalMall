// 应用配置
const config = {
  // 服务器配置
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  database: {
    path: process.env.DB_PATH || './database/mall.db'
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },
  
  // CORS配置
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },
  
  // 加密配置
  bcrypt: {
    saltRounds: 10
  },
  
  // 分页配置
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  }
};

module.exports = config;