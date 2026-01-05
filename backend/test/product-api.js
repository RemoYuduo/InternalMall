const axios = require('axios');
const { expect } = require('chai');

// API基础URL
const BASE_URL = 'http://localhost:3001/api';

// 测试数据
let adminToken = null;
let testProductId = null;
let testCategoryId = null;

describe('管理员商品管理API测试', () => {
  // 测试前获取管理员token
  before(async () => {
    try {
      const response = await axios.post(`${BASE_URL}/admin/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (response.data.success) {
        adminToken = response.data.data.token;
        console.log('管理员登录成功，获取token成功');
      } else {
        console.error('管理员登录失败:', response.data.message);
      }
    } catch (error) {
      console.error('登录请求失败:', error.message);
    }
  });

  // 测试获取商品分类
  it('应该能够获取商品分类列表', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.be.an('array');
      
      console.log('获取分类列表成功，分类数量:', response.data.data.length);
      
      // 保存第一个分类ID用于后续测试
      if (response.data.data.length > 0) {
        testCategoryId = response.data.data[0].id;
      }
    } catch (error) {
      console.error('获取分类列表失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试创建商品分类
  it('应该能够创建商品分类', async () => {
    try {
      const newCategory = {
        name: '测试分类',
        description: '这是一个测试分类',
        sort: 99
      };

      const response = await axios.post(`${BASE_URL}/admin/categories`, newCategory, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('name', '测试分类');
      
      console.log('创建分类成功:', response.data.data);
      
      // 保存新创建的分类ID用于后续测试
      testCategoryId = response.data.data.id;
    } catch (error) {
      console.error('创建分类失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试获取商品列表
  it('应该能够获取商品列表', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('products');
      expect(response.data.data.products).to.be.an('array');
      
      console.log('获取商品列表成功，商品数量:', response.data.data.products.length);
      
      // 保存第一个商品ID用于后续测试
      if (response.data.data.products.length > 0) {
        testProductId = response.data.data.products[0].id;
      }
    } catch (error) {
      console.error('获取商品列表失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试创建商品
  it('应该能够创建商品', async () => {
    try {
      const newProduct = {
        name: '测试商品',
        description: '这是一个测试商品',
        price: 199.99,
        pointsRequired: 50,
        stock: 100,
        categoryId: testCategoryId,
        specifications: {
          color: '红色',
          size: 'M'
        },
        exchangeRules: '每人限兑1个'
      };

      const response = await axios.post(`${BASE_URL}/admin/products`, newProduct, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('name', '测试商品');
      
      console.log('创建商品成功:', response.data.data);
      
      // 保存新创建的商品ID用于后续测试
      testProductId = response.data.data.id;
    } catch (error) {
      console.error('创建商品失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试更新商品
  it('应该能够更新商品', async () => {
    if (!testProductId) {
      console.log('跳过更新商品测试，没有可用的商品ID');
      return;
    }

    try {
      const updateData = {
        name: '更新后的测试商品',
        stock: 80,
        status: 'inactive'
      };

      const response = await axios.put(`${BASE_URL}/admin/products/${testProductId}`, updateData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('name', '更新后的测试商品');
      expect(response.data.data).to.have.property('stock', 80);
      expect(response.data.data).to.have.property('status', 'inactive');
      
      console.log('更新商品成功:', response.data.data);
    } catch (error) {
      console.error('更新商品失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试获取商品详情
  it('应该能够获取商品详情', async () => {
    if (!testProductId) {
      console.log('跳过获取商品详情测试，没有可用的商品ID');
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/admin/products/${testProductId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('id', testProductId);
      
      console.log('获取商品详情成功:', response.data.data);
    } catch (error) {
      console.error('获取商品详情失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试获取库存预警商品
  it('应该能够获取库存预警商品', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/products/low-stock`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.be.an('array');
      
      console.log('获取库存预警商品成功，商品数量:', response.data.data.length);
    } catch (error) {
      console.error('获取库存预警商品失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试获取热销商品
  it('应该能够获取热销商品', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/products/top-selling?limit=5`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.be.an('array');
      
      console.log('获取热销商品成功，商品数量:', response.data.data.length);
    } catch (error) {
      console.error('获取热销商品失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试批量更新商品状态
  it('应该能够批量更新商品状态', async () => {
    if (!testProductId) {
      console.log('跳过批量更新商品状态测试，没有可用的商品ID');
      return;
    }

    try {
      const response = await axios.put(`${BASE_URL}/admin/products/batch-status`, {
        productIds: [testProductId],
        status: 'active'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('updatedCount');
      
      console.log('批量更新商品状态成功:', response.data.data);
    } catch (error) {
      console.error('批量更新商品状态失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试删除商品
  it('应该能够删除商品', async () => {
    if (!testProductId) {
      console.log('跳过删除商品测试，没有可用的商品ID');
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}/admin/products/${testProductId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      
      console.log('删除商品成功');
    } catch (error) {
      console.error('删除商品失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试删除商品分类
  it('应该能够删除商品分类', async () => {
    if (!testCategoryId) {
      console.log('跳过删除分类测试，没有可用的分类ID');
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}/admin/categories/${testCategoryId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      
      console.log('删除分类成功');
    } catch (error) {
      console.error('删除分类失败:', error.response?.data || error.message);
      throw error;
    }
  });

  // 测试公开API
  describe('公开商品API测试', () => {
    // 测试获取公开商品列表
    it('应该能够获取公开商品列表', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/products`);

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data).to.have.property('products');
        expect(response.data.data.products).to.be.an('array');
        
        console.log('获取公开商品列表成功，商品数量:', response.data.data.products.length);
      } catch (error) {
        console.error('获取公开商品列表失败:', error.response?.data || error.message);
        throw error;
      }
    });

    // 测试获取商品分类
    it('应该能够获取公开商品分类', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/products/categories`);

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data).to.be.an('array');
        
        console.log('获取公开商品分类成功，分类数量:', response.data.data.length);
      } catch (error) {
        console.error('获取公开商品分类失败:', error.response?.data || error.message);
        throw error;
      }
    });

    // 测试搜索商品
    it('应该能够搜索商品', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/products?keyword=手机&category=1&sort=points_desc`);

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data).to.have.property('products');
        expect(response.data.data.products).to.be.an('array');
        
        console.log('搜索商品成功，商品数量:', response.data.data.products.length);
      } catch (error) {
        console.error('搜索商品失败:', error.response?.data || error.message);
        throw error;
      }
    });
  });
});

// 如果直接运行此文件，执行测试
if (require.main === module) {
  // 启动服务器
  console.log('开始测试管理员商品管理API...');
  console.log('请确保服务器已经启动在 http://localhost:3001');
  console.log('如果需要，请先运行: npm start');
  console.log('');
}