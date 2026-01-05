const ProductService = require('../services/productService');
const { successResponse, errorResponse } = require('../utils/response');

class ProductController {
  /**
   * 获取商品列表
   */
  static async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        sort = 'created_desc',
        status = 'active'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        sort,
        status
      };

      const result = await ProductService.getProducts(options);

      // 获取分类列表用于筛选
      const categories = await ProductService.getCategories({ status: 'active' });
      
      // 计算每个分类的商品数量
      const categoriesWithCount = await ProductService.getCategoriesWithProductCount();

      return successResponse(res, {
        ...result,
        filters: {
          categories: categoriesWithCount.map(cat => ({
            id: cat.id,
            name: cat.name,
            count: cat.product_count
          }))
        }
      });
    } catch (error) {
      console.error('获取商品列表失败:', error);
      return errorResponse(res, 'SYS_001', '获取商品列表失败', error.message);
    }
  }

  /**
   * 搜索商品
   */
  static async searchProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        keyword,
        category,
        sort = 'created_desc',
        status = 'active',
        minPoints,
        maxPoints
      } = req.query;

      const searchOptions = {
        keyword,
        category,
        minPoints: minPoints ? parseInt(minPoints) : undefined,
        maxPoints: maxPoints ? parseInt(maxPoints) : undefined,
        sortBy: sort,
        page: parseInt(page),
        limit: parseInt(limit),
        status
      };

      const result = await ProductService.searchProducts(searchOptions);

      // 获取分类列表用于筛选
      const categories = await ProductService.getCategories({ status: 'active' });
      
      // 计算每个分类的商品数量
      const categoriesWithCount = await ProductService.getCategoriesWithProductCount();

      return successResponse(res, {
        ...result,
        filters: {
          categories: categoriesWithCount.map(cat => ({
            id: cat.id,
            name: cat.name,
            count: cat.product_count
          }))
        }
      });
    } catch (error) {
      console.error('搜索商品失败:', error);
      return errorResponse(res, 'SYS_001', '搜索商品失败', error.message);
    }
  }

  /**
   * 获取商品详情
   */
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;
      
      const product = await ProductService.getProductById(id, userId);
      
      if (!product) {
        return errorResponse(res, 'PROD_001', '商品不存在');
      }

      return successResponse(res, product);
    } catch (error) {
      console.error('获取商品详情失败:', error);
      return errorResponse(res, 'SYS_001', '获取商品详情失败', error.message);
    }
  }

  /**
   * 获取商品分类
   */
  static async getCategories(req, res) {
    try {
      const { status = 'active' } = req.query;
      const categories = await ProductService.getCategories({ status });
      
      return successResponse(res, categories);
    } catch (error) {
      console.error('获取商品分类失败:', error);
      return errorResponse(res, 'SYS_001', '获取商品分类失败', error.message);
    }
  }

  /**
   * 添加/取消商品收藏
   */
  static async toggleFavorite(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // TODO: 实现收藏逻辑
      // 这里需要创建一个Favorite模型来处理收藏功能
      
      return successResponse(res, null, '操作成功');
    } catch (error) {
      console.error('商品收藏操作失败:', error);
      return errorResponse(res, 'SYS_001', '商品收藏操作失败', error.message);
    }
  }

  /**
   * 获取用户收藏商品
   */
  static async getFavorites(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.id;
      
      // TODO: 实现获取收藏商品逻辑
      // 这里需要创建一个Favorite模型来处理收藏功能
      
      return successResponse(res, {
        products: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0
        }
      });
    } catch (error) {
      console.error('获取收藏商品失败:', error);
      return errorResponse(res, 'SYS_001', '获取收藏商品失败', error.message);
    }
  }
}

module.exports = ProductController;