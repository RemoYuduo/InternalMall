const Product = require('../models/Product');
const Category = require('../models/Category');
const { run } = require('../config/database');

class ProductService {
  /**
   * 获取商品列表
   * @param {Object} options 查询选项
   * @returns {Promise<Object>} 商品列表和分页信息
   */
  static async getProducts(options = {}) {
    return await Product.getAll(options);
  }

  /**
   * 获取商品详情
   * @param {number} id 商品ID
   * @param {number} userId 用户ID（可选，用于记录浏览量）
   * @returns {Promise<Object|null>} 商品详情
   */
  static async getProductById(id, userId = null) {
    const product = await Product.getById(id);
    if (!product) return null;

    // 如果提供了用户ID，增加浏览量
    if (userId) {
      await this.incrementViews(id);
    }

    return product;
  }

  /**
   * 创建商品
   * @param {Object} productData 商品数据
   * @returns {Promise<Object>} 创建的商品信息
   */
  static async createProduct(productData) {
    // 验证分类是否存在
    if (productData.categoryId) {
      const category = await Category.getById(productData.categoryId);
      if (!category) {
        throw new Error('商品分类不存在');
      }
    }

    return await Product.create(productData);
  }

  /**
   * 更新商品
   * @param {number} id 商品ID
   * @param {Object} productData 商品数据
   * @returns {Promise<Object|null>} 更新后的商品信息
   */
  static async updateProduct(id, productData) {
    // 验证商品是否存在
    const existingProduct = await Product.getById(id);
    if (!existingProduct) {
      throw new Error('商品不存在');
    }

    // 如果更新了分类，验证分类是否存在
    if (productData.categoryId && productData.categoryId !== existingProduct.category_id) {
      const category = await Category.getById(productData.categoryId);
      if (!category) {
        throw new Error('商品分类不存在');
      }
    }

    return await Product.update(id, productData);
  }

  /**
   * 删除商品
   * @param {number} id 商品ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async deleteProduct(id) {
    // 验证商品是否存在
    const product = await Product.getById(id);
    if (!product) {
      throw new Error('商品不存在');
    }

    return await Product.delete(id);
  }

  /**
   * 更新商品库存
   * @param {number} id 商品ID
   * @param {number} quantity 变化数量
   * @returns {Promise<Object|null>} 更新后的商品信息
   */
  static async updateProductStock(id, quantity) {
    const product = await Product.updateStock(id, quantity);
    if (!product) {
      throw new Error('商品不存在');
    }

    return product;
  }

  /**
   * 增加商品浏览量
   * @param {number} id 商品ID
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async incrementViews(id) {
    // 这里简单地更新浏览量，实际应用中可能需要考虑去重等逻辑
    const query = `
      UPDATE products 
      SET views = views + 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    const result = await run(query, [id]);
    return result.changes > 0;
  }

  /**
   * 获取商品分类列表
   * @param {Object} options 查询选项
   * @returns {Promise<Array>} 分类列表
   */
  static async getCategories(options = {}) {
    return await Category.getAll(options);
  }

  /**
   * 获取分类及其商品数量
   * @returns {Promise<Array>} 分类列表，包含每个分类的商品数量
   */
  static async getCategoriesWithProductCount() {
    return await Category.getWithProductCount();
  }

  /**
   * 创建商品分类
   * @param {Object} categoryData 分类数据
   * @returns {Promise<Object>} 创建的分类信息
   */
  static async createCategory(categoryData) {
    return await Category.create(categoryData);
  }

  /**
   * 更新商品分类
   * @param {number} id 分类ID
   * @param {Object} categoryData 分类数据
   * @returns {Promise<Object|null>} 更新后的分类信息
   */
  static async updateCategory(id, categoryData) {
    return await Category.update(id, categoryData);
  }

  /**
   * 删除商品分类
   * @param {number} id 分类ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async deleteCategory(id) {
    return await Category.delete(id);
  }

  /**
   * 获取库存预警商品
   * @returns {Promise<Array>} 库存不足的商品列表
   */
  static async getLowStockProducts() {
    return await Product.getLowStockProducts();
  }

  /**
   * 获取热销商品
   * @param {number} limit 返回数量限制
   * @returns {Promise<Array>} 热销商品列表
   */
  static async getTopSellingProducts(limit = 10) {
    return await Product.getTopSellingProducts(limit);
  }

  /**
   * 搜索商品
   * @param {Object} searchOptions 搜索选项
   * @returns {Promise<Object>} 搜索结果和分页信息
   */
  static async searchProducts(searchOptions) {
    const { keyword, category, minPoints, maxPoints, sortBy, page = 1, limit = 10 } = searchOptions;
    
    const options = {
      page,
      limit,
      category,
      keyword,
      sort: sortBy || 'created_desc'
    };

    // 获取商品列表
    const result = await Product.getAll(options);

    // 如果有积分范围过滤，在结果中进一步过滤
    if (minPoints !== undefined || maxPoints !== undefined) {
      result.products = result.products.filter(product => {
        if (minPoints !== undefined && product.points_required < minPoints) return false;
        if (maxPoints !== undefined && product.points_required > maxPoints) return false;
        return true;
      });
    }

    return result;
  }

  /**
   * 批量更新商品状态
   * @param {Array} productIds 商品ID数组
   * @param {string} status 商品状态
   * @returns {Promise<number>} 更新的商品数量
   */
  static async batchUpdateStatus(productIds, status) {
    if (!productIds || productIds.length === 0) return 0;

    const placeholders = productIds.map(() => '?').join(',');
    const query = `
      UPDATE products 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders})
    `;
    
    const result = await run(query, [status, ...productIds]);
    return result.changes;
  }

  /**
   * 批量删除商品
   * @param {Array} productIds 商品ID数组
   * @returns {Promise<number>} 删除的商品数量
   */
  static async batchDeleteProducts(productIds) {
    if (!productIds || productIds.length === 0) return 0;

    const placeholders = productIds.map(() => '?').join(',');
    const query = `
      UPDATE products 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders})
    `;
    
    const result = await run(query, productIds);
    return result.changes;
  }
}

module.exports = ProductService;