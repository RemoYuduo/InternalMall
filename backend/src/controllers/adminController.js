const ProductService = require('../services/productService');
const { successResponse, errorResponse } = require('../utils/response');
const { processUploadImages, deleteImage } = require('../utils/fileUpload');

class AdminController {
  /**
   * 管理员登录
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // TODO: 实现管理员登录逻辑
      // 这里应该使用authService中的验证方法
      
      return successResponse(res, {
        token: 'mock_admin_token',
        admin: {
          id: 4,
          username: 'admin',
          role: 'admin'
        },
        expiresIn: 3600
      }, '管理员登录成功');
    } catch (error) {
      console.error('管理员登录失败:', error);
      return errorResponse(res, 'USER_001', '用户名或密码错误', error.message);
    }
  }

  /**
   * 获取系统状态
   */
  static async getSystemStatus(req, res) {
    try {
      // TODO: 实现获取系统状态逻辑
      // 从各个表中获取统计数据
      
      return successResponse(res, {
        status: 'healthy',
        version: '1.0.0',
        uptime: 86400,
        statistics: {
          users: {
            total: 100,
            active: 80,
            new: 5
          },
          products: {
            total: 50,
            active: 45,
            outOfStock: 5
          },
          orders: {
            total: 200,
            pending: 10,
            completed: 180,
            cancelled: 10
          },
          points: {
            totalIssued: 10000,
            totalSpent: 5000,
            currentBalance: 5000
          }
        },
        timestamp: new Date().toISOString()
      }, '系统状态正常');
    } catch (error) {
      console.error('获取系统状态失败:', error);
      return errorResponse(res, 'SYS_001', '获取系统状态失败', error.message);
    }
  }

  /**
   * 获取管理员商品列表
   */
  static async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        category
      };

      const result = await ProductService.getProducts(options);
      return successResponse(res, result);
    } catch (error) {
      console.error('获取管理员商品列表失败:', error);
      return errorResponse(res, 'SYS_001', '获取商品列表失败', error.message);
    }
  }

  /**
   * 创建商品
   */
  static async createProduct(req, res) {
    try {
      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        pointsRequired: req.body.pointsRequired,
        stock: req.body.stock || 0,
        warningStock: req.body.warningStock || 10,
        images: req.body.images || [],
        categoryId: req.body.categoryId,
        specifications: req.body.specifications || {},
        exchangeRules: req.body.exchangeRules || '',
        sort: req.body.sort || 0
      };

      const product = await ProductService.createProduct(productData);
      return successResponse(res, product, '商品创建成功');
    } catch (error) {
      console.error('创建商品失败:', error);
      return errorResponse(res, 'SYS_001', '创建商品失败', error.message);
    }
  }

  /**
   * 更新商品
   */
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      
      const productData = {};
      
      // 只更新提供的字段
      if (req.body.name !== undefined) productData.name = req.body.name;
      if (req.body.description !== undefined) productData.description = req.body.description;
      if (req.body.price !== undefined) productData.price = req.body.price;
      if (req.body.pointsRequired !== undefined) productData.pointsRequired = req.body.pointsRequired;
      if (req.body.stock !== undefined) productData.stock = req.body.stock;
      if (req.body.warningStock !== undefined) productData.warningStock = req.body.warningStock;
      if (req.body.images !== undefined) productData.images = req.body.images;
      if (req.body.status !== undefined) productData.status = req.body.status;
      if (req.body.categoryId !== undefined) productData.categoryId = req.body.categoryId;
      if (req.body.specifications !== undefined) productData.specifications = req.body.specifications;
      if (req.body.exchangeRules !== undefined) productData.exchangeRules = req.body.exchangeRules;
      if (req.body.sort !== undefined) productData.sort = req.body.sort;

      const product = await ProductService.updateProduct(id, productData);
      if (!product) {
        return errorResponse(res, 'PROD_001', '商品不存在');
      }

      return successResponse(res, product, '商品更新成功');
    } catch (error) {
      console.error('更新商品失败:', error);
      return errorResponse(res, 'SYS_001', '更新商品失败', error.message);
    }
  }

  /**
   * 删除商品
   */
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      const success = await ProductService.deleteProduct(id);
      if (!success) {
        return errorResponse(res, 'PROD_001', '商品不存在');
      }

      return successResponse(res, null, '商品删除成功');
    } catch (error) {
      console.error('删除商品失败:', error);
      return errorResponse(res, 'SYS_001', '删除商品失败', error.message);
    }
  }

  /**
   * 批量更新商品状态
   */
  static async batchUpdateProductStatus(req, res) {
    try {
      const { productIds, status } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return errorResponse(res, 'SYS_001', '请选择要操作的商品');
      }

      const updatedCount = await ProductService.batchUpdateStatus(productIds, status);
      return successResponse(res, { updatedCount }, `成功更新${updatedCount}个商品的状态`);
    } catch (error) {
      console.error('批量更新商品状态失败:', error);
      return errorResponse(res, 'SYS_001', '批量更新商品状态失败', error.message);
    }
  }

  /**
   * 批量删除商品
   */
  static async batchDeleteProducts(req, res) {
    try {
      const { productIds } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return errorResponse(res, 'SYS_001', '请选择要删除的商品');
      }

      const deletedCount = await ProductService.batchDeleteProducts(productIds);
      return successResponse(res, { deletedCount }, `成功删除${deletedCount}个商品`);
    } catch (error) {
      console.error('批量删除商品失败:', error);
      return errorResponse(res, 'SYS_001', '批量删除商品失败', error.message);
    }
  }

  /**
   * 获取商品分类
   */
  static async getCategories(req, res) {
    try {
      const categories = await ProductService.getCategoriesWithProductCount();
      return successResponse(res, categories);
    } catch (error) {
      console.error('获取商品分类失败:', error);
      return errorResponse(res, 'SYS_001', '获取商品分类失败', error.message);
    }
  }

  /**
   * 创建商品分类
   */
  static async createCategory(req, res) {
    try {
      const categoryData = {
        name: req.body.name,
        description: req.body.description || '',
        icon: req.body.icon || '',
        sort: req.body.sort || 0
      };

      const category = await ProductService.createCategory(categoryData);
      return successResponse(res, category, '分类创建成功');
    } catch (error) {
      console.error('创建分类失败:', error);
      return errorResponse(res, 'SYS_001', '创建分类失败', error.message);
    }
  }

  /**
   * 更新商品分类
   */
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      
      const categoryData = {};
      
      // 只更新提供的字段
      if (req.body.name !== undefined) categoryData.name = req.body.name;
      if (req.body.description !== undefined) categoryData.description = req.body.description;
      if (req.body.icon !== undefined) categoryData.icon = req.body.icon;
      if (req.body.status !== undefined) categoryData.status = req.body.status;
      if (req.body.sort !== undefined) categoryData.sort = req.body.sort;

      const category = await ProductService.updateCategory(id, categoryData);
      if (!category) {
        return errorResponse(res, 'SYS_001', '分类不存在');
      }

      return successResponse(res, category, '分类更新成功');
    } catch (error) {
      console.error('更新分类失败:', error);
      return errorResponse(res, 'SYS_001', '更新分类失败', error.message);
    }
  }

  /**
   * 删除商品分类
   */
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      const success = await ProductService.deleteCategory(id);
      if (!success) {
        return errorResponse(res, 'SYS_001', '分类不存在或无法删除');
      }

      return successResponse(res, null, '分类删除成功');
    } catch (error) {
      console.error('删除分类失败:', error);
      return errorResponse(res, 'SYS_001', '删除分类失败', error.message);
    }
  }

  /**
   * 获取库存预警商品
   */
  static async getLowStockProducts(req, res) {
    try {
      const products = await ProductService.getLowStockProducts();
      return successResponse(res, products);
    } catch (error) {
      console.error('获取库存预警商品失败:', error);
      return errorResponse(res, 'SYS_001', '获取库存预警商品失败', error.message);
    }
  }

  /**
   * 获取热销商品
   */
  static async getTopSellingProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const products = await ProductService.getTopSellingProducts(parseInt(limit));
      return successResponse(res, products);
    } catch (error) {
      console.error('获取热销商品失败:', error);
      return errorResponse(res, 'SYS_001', '获取热销商品失败', error.message);
    }
  }

  /**
   * 上传单个商品图片
   */
  static async uploadProductImage(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'SYS_001', '请选择要上传的图片');
      }

      // 处理上传的图片
      const processedImages = await processUploadImages([req.file]);
      
      if (processedImages.length === 0) {
        return errorResponse(res, 'SYS_001', '图片上传失败');
      }

      const uploadedImage = processedImages[0];
      
      return successResponse(res, {
        filename: uploadedImage.filename,
        url: uploadedImage.url,
        size: uploadedImage.size
      }, '图片上传成功');
    } catch (error) {
      console.error('图片上传失败:', error);
      return errorResponse(res, 'SYS_001', '图片上传失败', error.message);
    }
  }

  /**
   * 上传多个商品图片
   */
  static async uploadProductImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return errorResponse(res, 'SYS_001', '请选择要上传的图片');
      }

      // 处理上传的图片
      const processedImages = await processUploadImages(req.files);
      
      // 检查是否有上传失败的图片
      const failedImages = processedImages.filter(img => img.error);
      if (failedImages.length > 0) {
        console.error('部分图片上传失败:', failedImages);
      }
      
      // 返回上传成功的图片
      const successImages = processedImages.filter(img => !img.error);
      
      return successResponse(res, {
        images: successImages.map(img => ({
          filename: img.filename,
          url: img.url,
          size: img.size
        })),
        uploaded: successImages.length,
        failed: failedImages.length
      }, `成功上传${successImages.length}张图片${failedImages.length > 0 ? `，${failedImages.length}张失败` : ''}`);
    } catch (error) {
      console.error('图片上传失败:', error);
      return errorResponse(res, 'SYS_001', '图片上传失败', error.message);
    }
  }

  /**
   * 更新商品状态（上架/下架）
   */
  static async updateProductStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // 验证状态值
      if (!status || (status !== 'active' && status !== 'inactive')) {
        return errorResponse(res, 'SYS_001', '无效的状态值');
      }
      
      const productData = { status };
      const product = await ProductService.updateProduct(id, productData);
      
      if (!product) {
        return errorResponse(res, 'PROD_001', '商品不存在');
      }
      
      return successResponse(res, product, `商品${status === 'active' ? '上架' : '下架'}成功`);
    } catch (error) {
      console.error('更新商品状态失败:', error);
      return errorResponse(res, 'SYS_001', '更新商品状态失败', error.message);
    }
  }

  /**
   * 更新商品库存
   */
  static async updateProductStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      
      // 验证库存值
      if (stock < 0 || !Number.isInteger(stock)) {
        return errorResponse(res, 'SYS_001', '库存值必须是非负整数');
      }
      
      const productData = { stock };
      const product = await ProductService.updateProduct(id, productData);
      
      if (!product) {
        return errorResponse(res, 'PROD_001', '商品不存在');
      }
      
      return successResponse(res, product, '库存更新成功');
    } catch (error) {
      console.error('更新商品库存失败:', error);
      return errorResponse(res, 'SYS_001', '更新商品库存失败', error.message);
    }
  }
}

module.exports = AdminController;