const { query: dbQuery, get, run } = require('../config/database');
const Category = require('./Category');

class Product {
  /**
   * 获取所有商品
   * @param {Object} options 查询选项
   * @param {number} options.page 页码
   * @param {number} options.limit 每页数量
   * @param {number} options.category 分类ID
   * @param {string} options.sort 排序方式
   * @param {string} options.keyword 搜索关键词
   * @param {string} options.status 商品状态
   * @returns {Promise<Object>} 商品列表和分页信息
   */
  static async getAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      category = null,
      sort = 'created_desc',
      keyword = '',
      status = null
    } = options;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    // 构建WHERE条件
    whereConditions.push('p.deleted_at IS NULL');
    
    if (status) {
      whereConditions.push('p.status = ?');
      params.push(status);
    }

    if (category) {
      whereConditions.push('p.category_id = ?');
      params.push(category);
    }

    if (keyword) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // 构建ORDER BY子句
    let orderClause = 'ORDER BY ';
    switch (sort) {
      case 'points_asc':
        orderClause += 'p.points_required ASC';
        break;
      case 'points_desc':
        orderClause += 'p.points_required DESC';
        break;
      case 'created_asc':
        orderClause += 'p.created_at ASC';
        break;
      case 'created_desc':
      default:
        orderClause += 'p.created_at DESC';
        break;
    }

    // 查询商品列表
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.points_required,
        p.stock,
        p.warning_stock,
        p.images,
        p.status,
        p.category_id,
        p.sales,
        p.views,
        p.favorites,
        p.exchange_rules,
        p.specifications,
        p.sort,
        p.created_at,
        p.updated_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const products = await dbQuery(productsQuery, params);

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;

    const countParams = params.slice(0, -2); // 移除limit和offset参数
    const countResult = await get(countQuery, countParams);
    const total = countResult.total;

    // 处理图片和规格JSON字段
    products.forEach(product => {
      try {
        product.images = product.images ? JSON.parse(product.images) : [];
        product.specifications = product.specifications ? JSON.parse(product.specifications) : {};
      } catch (error) {
        product.images = [];
        product.specifications = {};
      }
    });

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根据ID获取商品
   * @param {number} id 商品ID
   * @returns {Promise<Object|null>} 商品信息
   */
  static async getById(id) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.points_required,
        p.stock,
        p.warning_stock,
        p.images,
        p.status,
        p.category_id,
        p.sales,
        p.views,
        p.favorites,
        p.exchange_rules,
        p.specifications,
        p.sort,
        p.created_at,
        p.updated_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `;

    const product = await get(query, [id]);
    if (!product) return null;

    // 处理图片和规格JSON字段
    try {
      product.images = product.images ? JSON.parse(product.images) : [];
      product.specifications = product.specifications ? JSON.parse(product.specifications) : {};
    } catch (error) {
      product.images = [];
      product.specifications = {};
    }

    return product;
  }

  /**
   * 创建商品
   * @param {Object} productData 商品数据
   * @returns {Promise<Object>} 创建的商品信息
   */
  static async create(productData) {
    const {
      name,
      description,
      price,
      pointsRequired,
      stock = 0,
      warningStock = 10,
      images = [],
      categoryId,
      specifications = {},
      exchangeRules = '',
      sort = 0
    } = productData;

    const imagesJson = JSON.stringify(images);
    const specificationsJson = JSON.stringify(specifications);

    const query = `
      INSERT INTO products (
        name, description, price, points_required, stock, warning_stock,
        images, category_id, specifications, exchange_rules, sort, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    const result = await run(query, [
      name, description, price, pointsRequired, stock, warningStock,
      imagesJson, categoryId, specificationsJson, exchangeRules, sort
    ]);

    return await this.getById(result.lastID);
  }

  /**
   * 更新商品
   * @param {number} id 商品ID
   * @param {Object} productData 商品数据
   * @returns {Promise<Object|null>} 更新后的商品信息
   */
  static async update(id, productData) {
    const {
      name,
      description,
      price,
      pointsRequired,
      stock,
      warningStock,
      images,
      status,
      categoryId,
      specifications,
      exchangeRules,
      sort
    } = productData;

    const existingProduct = await this.getById(id);
    if (!existingProduct) return null;

    const updates = [];
    const params = [];

    // 构建更新字段
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }
    if (pointsRequired !== undefined) {
      updates.push('points_required = ?');
      params.push(pointsRequired);
    }
    if (stock !== undefined) {
      updates.push('stock = ?');
      params.push(stock);
    }
    if (warningStock !== undefined) {
      updates.push('warning_stock = ?');
      params.push(warningStock);
    }
    if (images !== undefined) {
      updates.push('images = ?');
      params.push(JSON.stringify(images));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (categoryId !== undefined) {
      updates.push('category_id = ?');
      params.push(categoryId);
    }
    if (specifications !== undefined) {
      updates.push('specifications = ?');
      params.push(JSON.stringify(specifications));
    }
    if (exchangeRules !== undefined) {
      updates.push('exchange_rules = ?');
      params.push(exchangeRules);
    }
    if (sort !== undefined) {
      updates.push('sort = ?');
      params.push(sort);
    }

    if (updates.length === 0) return existingProduct;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const updateQuery = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
    await run(updateQuery, params);

    return await this.getById(id);
  }

  /**
   * 删除商品（软删除）
   * @param {number} id 商品ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async delete(id) {
    const deleteQuery = 'UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await run(deleteQuery, [id]);
    return result.changes > 0;
  }

  /**
   * 更新商品库存
   * @param {number} id 商品ID
   * @param {number} quantity 变化数量（正数增加，负数减少）
   * @returns {Promise<Object|null>} 更新后的商品信息
   */
  static async updateStock(id, quantity) {
    const product = await this.getById(id);
    if (!product) return null;

    const newStock = product.stock + quantity;
    if (newStock < 0) throw new Error('库存不足');

    const updateStockQuery = `
      UPDATE products 
      SET stock = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await run(updateStockQuery, [newStock, id]);
    return await this.getById(id);
  }

  /**
   * 增加商品销量
   * @param {number} id 商品ID
   * @param {number} quantity 销量数量
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async increaseSales(id, quantity) {
    const salesQuery = `
      UPDATE products 
      SET sales = sales + ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    const result = await run(salesQuery, [quantity, id]);
    return result.changes > 0;
  }

  /**
   * 获取库存预警商品
   * @returns {Promise<Array>} 库存不足的商品列表
   */
  static async getLowStockProducts() {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.stock,
        p.warning_stock,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock <= p.warning_stock AND p.status = 'active' AND p.deleted_at IS NULL
      ORDER BY p.stock ASC
    `;

    return await query(query);
  }

  /**
   * 获取热销商品
   * @param {number} limit 返回数量限制
   * @returns {Promise<Array>} 热销商品列表
   */
  static async getTopSellingProducts(limit = 10) {
    const topSellingQuery = `
      SELECT 
        p.id,
        p.name,
        p.points_required,
        p.sales,
        p.images,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' AND p.deleted_at IS NULL
      ORDER BY p.sales DESC
      LIMIT ?
    `;

    const products = await query(topSellingQuery, [limit]);
    
    // 处理图片JSON字段
    products.forEach(product => {
      try {
        product.images = product.images ? JSON.parse(product.images) : [];
        // 向后兼容：如果没有图片数组但有单个图片，则创建包含单个图片的数组
        if (product.images.length === 0 && product.image) {
          product.images = [product.image];
        }
      } catch (error) {
        product.images = [];
      }
    });

    return products;
  }
}

module.exports = Product;