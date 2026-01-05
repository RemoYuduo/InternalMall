const { db } = require('../config/database');

class Cart {
  /**
   * 获取用户的购物车列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} - 购物车商品列表
   */
  static async getCartByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          c.id,
          c.user_id,
          c.product_id,
          c.quantity,
          c.is_selected,
          c.created_at,
          c.updated_at,
          p.name as product_name,
          p.description as product_description,
          p.price,
          p.points_required,
          p.stock,
          p.images,
          p.status as product_status,
          cat.name as category_name
        FROM cart c
        LEFT JOIN products p ON c.product_id = p.id
        LEFT JOIN categories cat ON p.category_id = cat.id
        WHERE c.user_id = ? AND p.status = 'active'
        ORDER BY c.created_at DESC
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          console.error('获取购物车失败:', err);
          return reject(err);
        }
        
        // 处理图片字段
        const cartItems = rows.map(item => {
          return {
            ...item,
            images: item.images ? JSON.parse(item.images) : [],
            is_selected: Boolean(item.is_selected)
          };
        });
        
        resolve(cartItems);
      });
    });
  }

  /**
   * 添加商品到购物车
   * @param {number} userId - 用户ID
   * @param {number} productId - 商品ID
   * @param {number} quantity - 数量
   * @returns {Promise<Object>} - 操作结果
   */
  static async addToCart(userId, productId, quantity = 1) {
    return new Promise((resolve, reject) => {
      // 首先检查商品是否存在且库存充足
      const checkProductSql = `
        SELECT id, name, stock, status
        FROM products
        WHERE id = ? AND status = 'active'
      `;
      
      db.get(checkProductSql, [productId], (err, product) => {
        if (err) {
          console.error('检查商品失败:', err);
          return reject(err);
        }
        
        if (!product) {
          return reject(new Error('商品不存在或已下架'));
        }
        
        if (product.stock < quantity) {
          return reject(new Error('商品库存不足'));
        }
        
        // 检查购物车中是否已存在该商品
        const checkCartSql = `
          SELECT id, quantity
          FROM cart
          WHERE user_id = ? AND product_id = ?
        `;
        
        db.get(checkCartSql, [userId, productId], (err, cartItem) => {
          if (err) {
            console.error('检查购物车失败:', err);
            return reject(err);
          }
          
          if (cartItem) {
            // 商品已存在，更新数量
            const newQuantity = cartItem.quantity + quantity;
            
            if (product.stock < newQuantity) {
              return reject(new Error('商品库存不足'));
            }
            
            const updateSql = `
              UPDATE cart
              SET quantity = ?, is_selected = 1, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `;
            
            db.run(updateSql, [newQuantity, cartItem.id], function(err) {
              if (err) {
                console.error('更新购物车失败:', err);
                return reject(err);
              }
              
              resolve({
                success: true,
                message: '购物车商品数量更新成功',
                cartId: cartItem.id,
                quantity: newQuantity
              });
            });
          } else {
            // 商品不存在，插入新记录
            const insertSql = `
              INSERT INTO cart (user_id, product_id, quantity, is_selected)
              VALUES (?, ?, ?, 1)
            `;
            
            db.run(insertSql, [userId, productId, quantity], function(err) {
              if (err) {
                console.error('添加到购物车失败:', err);
                return reject(err);
              }
              
              resolve({
                success: true,
                message: '商品已添加到购物车',
                cartId: this.lastID,
                quantity: quantity
              });
            });
          }
        });
      });
    });
  }

  /**
   * 更新购物车商品数量
   * @param {number} userId - 用户ID
   * @param {number} cartId - 购物车项ID
   * @param {number} quantity - 新数量
   * @returns {Promise<Object>} - 操作结果
   */
  static async updateQuantity(userId, cartId, quantity) {
    return new Promise((resolve, reject) => {
      if (quantity <= 0) {
        return reject(new Error('商品数量必须大于0'));
      }
      
      // 检查购物车项是否属于当前用户
      const checkCartSql = `
        SELECT c.id, c.product_id, c.quantity, p.stock, p.status
        FROM cart c
        LEFT JOIN products p ON c.product_id = p.id
        WHERE c.id = ? AND c.user_id = ? AND p.status = 'active'
      `;
      
      db.get(checkCartSql, [cartId, userId], (err, cartItem) => {
        if (err) {
          console.error('检查购物车失败:', err);
          return reject(err);
        }
        
        if (!cartItem) {
          return reject(new Error('购物车项不存在'));
        }
        
        if (cartItem.stock < quantity) {
          return reject(new Error('商品库存不足'));
        }
        
        // 更新数量
        const updateSql = `
          UPDATE cart
          SET quantity = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND user_id = ?
        `;
        
        db.run(updateSql, [quantity, cartId, userId], function(err) {
          if (err) {
            console.error('更新购物车数量失败:', err);
            return reject(err);
          }
          
          resolve({
            success: true,
            message: '购物车商品数量更新成功',
            quantity: quantity
          });
        });
      });
    });
  }

  /**
   * 更新购物车商品选中状态
   * @param {number} userId - 用户ID
   * @param {number} cartId - 购物车项ID
   * @param {boolean} isSelected - 是否选中
   * @returns {Promise<Object>} - 操作结果
   */
  static async updateSelectedStatus(userId, cartId, isSelected) {
    return new Promise((resolve, reject) => {
      const updateSql = `
        UPDATE cart
        SET is_selected = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;
      
      db.run(updateSql, [isSelected ? 1 : 0, cartId, userId], function(err) {
        if (err) {
          console.error('更新购物车选中状态失败:', err);
          return reject(err);
        }
        
        if (this.changes === 0) {
          return reject(new Error('购物车项不存在'));
        }
        
        resolve({
          success: true,
          message: '购物车商品状态更新成功',
          is_selected: isSelected
        });
      });
    });
  }

  /**
   * 批量更新购物车商品选中状态
   * @param {number} userId - 用户ID
   * @param {Array<number>} cartIds - 购物车项ID数组
   * @param {boolean} isSelected - 是否选中
   * @returns {Promise<Object>} - 操作结果
   */
  static async updateMultipleSelectedStatus(userId, cartIds, isSelected) {
    return new Promise((resolve, reject) => {
      if (!cartIds || cartIds.length === 0) {
        return resolve({
          success: true,
          message: '没有需要更新的项'
        });
      }
      
      const placeholders = cartIds.map(() => '?').join(',');
      const updateSql = `
        UPDATE cart
        SET is_selected = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND id IN (${placeholders})
      `;
      
      db.run(updateSql, [isSelected ? 1 : 0, userId, ...cartIds], function(err) {
        if (err) {
          console.error('批量更新购物车选中状态失败:', err);
          return reject(err);
        }
        
        resolve({
          success: true,
          message: `已更新${this.changes}项购物车商品状态`,
          updatedCount: this.changes
        });
      });
    });
  }

  /**
   * 删除购物车项
   * @param {number} userId - 用户ID
   * @param {number} cartId - 购物车项ID
   * @returns {Promise<Object>} - 操作结果
   */
  static async removeFromCart(userId, cartId) {
    return new Promise((resolve, reject) => {
      const deleteSql = `
        DELETE FROM cart
        WHERE id = ? AND user_id = ?
      `;
      
      db.run(deleteSql, [cartId, userId], function(err) {
        if (err) {
          console.error('删除购物车项失败:', err);
          return reject(err);
        }
        
        if (this.changes === 0) {
          return reject(new Error('购物车项不存在'));
        }
        
        resolve({
          success: true,
          message: '购物车商品删除成功'
        });
      });
    });
  }

  /**
   * 批量删除购物车项
   * @param {number} userId - 用户ID
   * @param {Array<number>} cartIds - 购物车项ID数组
   * @returns {Promise<Object>} - 操作结果
   */
  static async batchRemoveFromCart(userId, cartIds) {
    return new Promise((resolve, reject) => {
      if (!cartIds || cartIds.length === 0) {
        return resolve({
          success: true,
          message: '没有需要删除的项'
        });
      }
      
      const placeholders = cartIds.map(() => '?').join(',');
      const deleteSql = `
        DELETE FROM cart
        WHERE user_id = ? AND id IN (${placeholders})
      `;
      
      db.run(deleteSql, [userId, ...cartIds], function(err) {
        if (err) {
          console.error('批量删除购物车项失败:', err);
          return reject(err);
        }
        
        resolve({
          success: true,
          message: `已删除${this.changes}项购物车商品`,
          deletedCount: this.changes
        });
      });
    });
  }

  /**
   * 清空购物车
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 操作结果
   */
  static async clearCart(userId) {
    return new Promise((resolve, reject) => {
      const deleteSql = `
        DELETE FROM cart
        WHERE user_id = ?
      `;
      
      db.run(deleteSql, [userId], function(err) {
        if (err) {
          console.error('清空购物车失败:', err);
          return reject(err);
        }
        
        resolve({
          success: true,
          message: '购物车已清空',
          deletedCount: this.changes
        });
      });
    });
  }

  /**
   * 获取购物车选中商品的积分合计
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 积分统计信息
   */
  static async getCartPointsSummary(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as selected_count,
          SUM(c.quantity * p.points_required) as total_points,
          SUM(c.quantity) as total_quantity
        FROM cart c
        LEFT JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ? AND c.is_selected = 1 AND p.status = 'active'
      `;
      
      db.get(sql, [userId], (err, result) => {
        if (err) {
          console.error('获取购物车积分统计失败:', err);
          return reject(err);
        }
        
        resolve({
          selectedCount: result.selected_count || 0,
          totalPoints: result.total_points || 0,
          totalQuantity: result.total_quantity || 0
        });
      });
    });
  }

  /**
   * 获取用户购物车数量统计
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 数量统计
   */
  static async getCartCount(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_count,
          SUM(CASE WHEN is_selected = 1 THEN 1 ELSE 0 END) as selected_count
        FROM cart
        WHERE user_id = ?
      `;
      
      db.get(sql, [userId], (err, result) => {
        if (err) {
          console.error('获取购物车数量统计失败:', err);
          return reject(err);
        }
        
        resolve({
          totalCount: result.total_count || 0,
          selectedCount: result.selected_count || 0
        });
      });
    });
  }
}

module.exports = Cart;