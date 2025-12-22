const { query: dbQuery, get, run } = require('../config/database');

class Category {
  /**
   * 获取所有分类
   * @param {Object} options 查询选项
   * @param {string} options.status 分类状态
   * @returns {Promise<Array>} 分类列表
   */
  static async getAll(options = {}) {
    const { status = 'active' } = options;
    
    let query = `
      SELECT 
        id, name, description, sort, icon, status, created_at, updated_at
      FROM categories
    `;
    
    let params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY sort ASC, created_at ASC';
    
    const categories = await dbQuery(query, params);
    return categories;
  }

  /**
   * 根据ID获取分类
   * @param {number} id 分类ID
   * @returns {Promise<Object|null>} 分类信息
   */
  static async getById(id) {
    const query = `
      SELECT 
        id, name, description, sort, icon, status, created_at, updated_at
      FROM categories
      WHERE id = ? AND deleted_at IS NULL
    `;
    
    return await get(query, [id]);
  }

  /**
   * 创建分类
   * @param {Object} categoryData 分类数据
   * @returns {Promise<Object>} 创建的分类信息
   */
  static async create(categoryData) {
    const {
      name,
      description = '',
      icon = '',
      sort = 0
    } = categoryData;

    const query = `
      INSERT INTO categories (name, description, icon, sort, status)
      VALUES (?, ?, ?, ?, 'active')
    `;

    const result = await run(query, [name, description, icon, sort]);
    return await this.getById(result.lastID);
  }

  /**
   * 更新分类
   * @param {number} id 分类ID
   * @param {Object} categoryData 分类数据
   * @returns {Promise<Object|null>} 更新后的分类信息
   */
  static async update(id, categoryData) {
    const {
      name,
      description,
      icon,
      status,
      sort
    } = categoryData;

    const existingCategory = await this.getById(id);
    if (!existingCategory) return null;

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
    if (icon !== undefined) {
      updates.push('icon = ?');
      params.push(icon);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (sort !== undefined) {
      updates.push('sort = ?');
      params.push(sort);
    }

    if (updates.length === 0) return existingCategory;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const updateQuery = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
    await run(updateQuery, params);

    return await this.getById(id);
  }

  /**
   * 删除分类（软删除）
   * @param {number} id 分类ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async delete(id) {
    // 检查是否有商品使用该分类
    const productCheckQuery = 'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND deleted_at IS NULL';
    const productCheckResult = await get(productCheckQuery, [id]);
    
    if (productCheckResult.count > 0) {
      throw new Error('该分类下存在商品，无法删除');
    }

    const deleteQuery = 'UPDATE categories SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await run(deleteQuery, [id]);
    return result.changes > 0;
  }

  /**
   * 获取分类及其商品数量
   * @returns {Promise<Array>} 分类列表，包含每个分类的商品数量
   */
  static async getWithProductCount() {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.icon,
        c.sort,
        c.status,
        c.created_at,
        c.updated_at,
        COALESCE(p.product_count, 0) as product_count
      FROM categories c
      LEFT JOIN (
        SELECT category_id, COUNT(*) as product_count
        FROM products
        WHERE deleted_at IS NULL
        GROUP BY category_id
      ) p ON c.id = p.category_id
      WHERE c.deleted_at IS NULL
      ORDER BY c.sort ASC, c.created_at ASC
    `;

    return await dbQuery(query);
  }
}

module.exports = Category;