/**
 * 统一响应格式工具
 */

/**
 * 成功响应
 * @param {Object} res Express响应对象
 * @param {*} data 响应数据
 * @param {string} message 响应消息
 * @returns {Object} Express响应
 */
function successResponse(res, data = null, message = '操作成功') {
  return res.status(200).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

/**
 * 错误响应
 * @param {Object} res Express响应对象
 * @param {string} code 错误码
 * @param {string} message 错误消息
 * @param {string} details 错误详情
 * @param {number} status HTTP状态码
 * @returns {Object} Express响应
 */
function errorResponse(res, code, message, details = null, status = 400) {
  // 根据错误码设置HTTP状态码
  const statusCode = getStatusCodeByErrorCode(code) || status;
  
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * 根据错误码获取HTTP状态码
 * @param {string} code 错误码
 * @returns {number} HTTP状态码
 */
function getStatusCodeByErrorCode(code) {
  const statusCodeMap = {
    'AUTH_001': 401,
    'AUTH_002': 401,
    'AUTH_003': 401,
    'AUTH_004': 403,
    'USER_001': 400,
    'USER_002': 404,
    'USER_003': 409,
    'PROD_001': 404,
    'PROD_002': 400,
    'CART_001': 400,
    'ORDER_001': 400,
    'ORDER_002': 404,
    'SYS_001': 500,
    'SYS_002': 503
  };
  
  return statusCodeMap[code];
}

/**
 * 分页响应
 * @param {Object} res Express响应对象
 * @param {Array} items 数据列表
 * @param {Object} pagination 分页信息
 * @param {string} message 响应消息
 * @returns {Object} Express响应
 */
function paginatedResponse(res, items, pagination, message = '获取数据成功') {
  return res.status(200).json({
    success: true,
    message,
    data: {
      items,
      pagination
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  getStatusCodeByErrorCode
};