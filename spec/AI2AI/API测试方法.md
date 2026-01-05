# API测试方法文档

## 概述
本文档简要总结内部企业商城API的测试方法和使用工具。

## 测试工具
- 使用Node.js原生`http`和`https`模块进行API测试
- 测试脚本位置：`backend/test-api.js`

## 测试方法

### 1. 基础HTTP请求函数
创建封装Promise的`makeRequest`函数，支持GET和POST请求，处理响应数据。

### 2. 测试流程
1. **健康检查测试**：验证服务器是否正常运行
   - GET请求：`/api/health`

2. **管理员认证测试**：获取JWT令牌用于后续认证
   - POST请求：`/api/admin/login`
   - 请求体：`{"username": "admin", "password": "admin123"}`

3. **公开API测试**（无需认证）：
   - 获取商品列表：`GET /api/products`
   - 获取商品分类：`GET /api/products/categories`

4. **管理员API测试**（需要认证）：
   - 获取管理员商品列表：`GET /api/admin/products`
   - 获取管理员分类列表：`GET /api/admin/categories`
   - 创建商品：`POST /api/admin/products`
   - 请求体示例：
     ```json
     {
       "name": "API测试商品",
       "description": "测试商品描述",
       "price": 99.99,
       "pointsRequired": 20,
       "stock": 50,
       "categoryId": 1,
       "specifications": {
         "color": "蓝色",
         "size": "L"
       },
       "exchangeRules": "每人限兑1个"
     }
     ```

## 认证机制
- 使用Bearer Token认证
- 请求头格式：`Authorization: Bearer ${token}`

## 测试结果验证
每个API测试都会输出：
- HTTP状态码
- 响应体内容

## 运行测试
```bash
cd backend
node test-api.js
```

## 测试顺序要求
1. 必须先进行健康检查
2. 然后进行管理员登录获取token
3. 无需认证的公开API可随时测试
4. 需要认证的管理员API必须先获取有效token