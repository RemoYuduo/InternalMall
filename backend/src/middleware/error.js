// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  console.error(err);

  // Mongoose 错误处理
  if (err.name === 'CastError') {
    const message = '资源未找到';
    error = { message, statusCode: 404 };
  }

  // Mongoose 重复键值错误
  if (err.code === 11000) {
    const message = '重复的字段值';
    error = { message, statusCode: 400 };
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的令牌';
    error = { message, statusCode: 401 };
  }

  // JWT 过期错误
  if (err.name === 'TokenExpiredError') {
    const message = '令牌已过期';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器错误'
  });
};

module.exports = errorHandler;