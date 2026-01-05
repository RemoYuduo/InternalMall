// 简单的API测试脚本
const http = require('http');
const https = require('https');

// 发送HTTP请求的辅助函数
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

// 测试API函数
async function testAPI() {
  console.log('开始测试商品管理API...\n');
  
  // 测试健康检查
  try {
    console.log('1. 测试健康检查API...');
    const healthOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    };
    
    const healthRes = await makeRequest(healthOptions);
    console.log(`状态码: ${healthRes.statusCode}`);
    console.log(`响应: ${healthRes.body}\n`);
  } catch (error) {
    console.error('健康检查测试失败:', error.message);
  }

  // 测试管理员登录
  let adminToken = null;
  try {
    console.log('2. 测试管理员登录API...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });
    
    const loginRes = await makeRequest(loginOptions, loginData);
    console.log(`状态码: ${loginRes.statusCode}`);
    console.log(`响应: ${loginRes.body}\n`);
    
    // 解析响应获取token
    const loginResult = JSON.parse(loginRes.body);
    if (loginResult.success) {
      adminToken = loginResult.data.token;
      console.log('管理员登录成功，获取到token\n');
    }
  } catch (error) {
    console.error('管理员登录测试失败:', error.message);
  }

  // 测试获取商品列表（公开API）
  try {
    console.log('3. 测试获取商品列表（公开API）...');
    const productListOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/products',
      method: 'GET'
    };
    
    const productListRes = await makeRequest(productListOptions);
    console.log(`状态码: ${productListRes.statusCode}`);
    console.log(`响应: ${productListRes.body}\n`);
  } catch (error) {
    console.error('获取商品列表测试失败:', error.message);
  }

  // 测试获取商品分类（公开API）
  try {
    console.log('4. 测试获取商品分类（公开API）...');
    const categoryListOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/products/categories',
      method: 'GET'
    };
    
    const categoryListRes = await makeRequest(categoryListOptions);
    console.log(`状态码: ${categoryListRes.statusCode}`);
    console.log(`响应: ${categoryListRes.body}\n`);
  } catch (error) {
    console.error('获取商品分类测试失败:', error.message);
  }

  // 测试获取管理员商品列表（需要认证）
  if (adminToken) {
    try {
      console.log('5. 测试获取管理员商品列表（需要认证）...');
      const adminProductListOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/admin/products',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      };
      
      const adminProductListRes = await makeRequest(adminProductListOptions);
      console.log(`状态码: ${adminProductListRes.statusCode}`);
      console.log(`响应: ${adminProductListRes.body}\n`);
    } catch (error) {
      console.error('获取管理员商品列表测试失败:', error.message);
    }

    // 测试获取管理员分类列表（需要认证）
    try {
      console.log('6. 测试获取管理员分类列表（需要认证）...');
      const adminCategoryListOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/admin/categories',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      };
      
      const adminCategoryListRes = await makeRequest(adminCategoryListOptions);
      console.log(`状态码: ${adminCategoryListRes.statusCode}`);
      console.log(`响应: ${adminCategoryListRes.body}\n`);
    } catch (error) {
      console.error('获取管理员分类列表测试失败:', error.message);
    }

    // 测试创建商品（需要认证）
    try {
      console.log('7. 测试创建商品（需要认证）...');
      const createProductOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/admin/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      };
      
      const createProductData = JSON.stringify({
        name: 'API测试商品',
        description: '这是一个通过API创建的测试商品',
        price: 99.99,
        pointsRequired: 20,
        stock: 50,
        categoryId: 1,
        specifications: {
          color: '蓝色',
          size: 'L'
        },
        exchangeRules: '每人限兑1个'
      });
      
      const createProductRes = await makeRequest(createProductOptions, createProductData);
      console.log(`状态码: ${createProductRes.statusCode}`);
      console.log(`响应: ${createProductRes.body}\n`);
    } catch (error) {
      console.error('创建商品测试失败:', error.message);
    }
  }

  console.log('API测试完成！');
}

// 执行测试
testAPI().catch(error => {
  console.error('测试过程中发生错误:', error);
});