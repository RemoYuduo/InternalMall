const Cart = require('../models/Cart');

class CartService {
  /**
   * 获取用户购物车列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 购物车列表和统计信息
   */
  static async getCartItems(userId) {
    try {
      const cartItems = await Cart.getCartByUserId(userId);
      const pointsSummary = await Cart.getCartPointsSummary(userId);
      
      return {
        success: true,
        cartItems: cartItems,
        summary: pointsSummary
      };
    } catch (error) {
      console.error('获取购物车列表失败:', error);
      throw {
        success: false,
        message: '获取购物车列表失败',
        error: error.message
      };
    }
  }

  /**
   * 添加商品到购物车
   * @param {number} userId - 用户ID
   * @param {number} productId - 商品ID
   * @param {number} quantity - 数量
   * @returns {Promise<Object>} - 操作结果
   */
  static async addToCart(userId, productId, quantity) {
    try {
      if (!productId || !quantity || quantity <= 0) {
        throw new Error('商品ID和数量必须为正整数');
      }

      const result = await Cart.addToCart(userId, productId, quantity);
      
      // 获取更新后的购物车统计
      const summary = await Cart.getCartPointsSummary(userId);
      
      return {
        success: true,
        message: result.message,
        data: {
          cartId: result.cartId,
          quantity: result.quantity,
          summary
        }
      };
    } catch (error) {
      console.error('添加商品到购物车失败:', error);
      return {
        success: false,
        message: error.message || '添加商品到购物车失败',
        error: error.message
      };
    }
  }

  /**
   * 更新购物车商品数量
   * @param {number} userId - 用户ID
   * @param {number} cartId - 购物车项ID
   * @param {number} quantity - 新数量
   * @returns {Promise<Object>} - 操作结果
   */
  static async updateItemQuantity(userId, cartId, quantity) {
    try {
      if (!cartId || !quantity || quantity <= 0) {
        throw new Error('购物车项ID和数量必须为正整数');
      }

      const result = await Cart.updateQuantity(userId, cartId, quantity);
      
      // 获取更新后的购物车统计
      const summary = await Cart.getCartPointsSummary(userId);
      
      return {
        success: true,
        message: result.message,
        data: {
          quantity: result.quantity,
          summary
        }
      };
    } catch (error) {
      console.error('更新购物车商品数量失败:', error);
      return {
        success: false,
        message: error.message || '更新购物车商品数量失败',
        error: error.message
      };
    }
  }

  /**
   * 更新购物车商品选中状态
   * @param {number} userId - 用户ID
   * @param {number} cartId - 购物车项ID
   * @param {boolean} isSelected - 是否选中
   * @returns {Promise<Object>} - 操作结果
   */
  static async updateItemSelection(userId, cartId, isSelected) {
    try {
      if (!cartId) {
        throw new Error('购物车项ID不能为空');
      }

      const result = await Cart.updateSelectedStatus(userId, cartId, isSelected);
      
      // 获取更新后的购物车统计
      const summary = await Cart.getCartPointsSummary(userId);
      
      return {
        success: true,
        message: result.message,
        data: {
          is_selected: result.is_selected,
          summary
        }
      };
    } catch (error) {
      console.error('更新购物车商品选中状态失败:', error);
      return {
        success: false,
        message: error.message || '更新购物车商品选中状态失败',
        error: error.message
      };
    }
  }

  /**
   * 批量更新购物车商品选中状态
   * @param {number} userId - 用户ID
   * @param {Array<number>} cartIds - 购物车项ID数组
   * @param {boolean} isSelected - 是否选中
   * @returns {Promise<Object>} - 操作结果
   */
  static async updateMultipleItemsSelection(userId, cartIds, isSelected) {
    try {
      if (!cartIds || !Array.isArray(cartIds)) {
        throw new Error('购物车项ID数组不能为空');
      }

      const result = await Cart.updateMultipleSelectedStatus(userId, cartIds, isSelected);
      
      // 获取更新后的购物车统计
      const summary = await Cart.getCartPointsSummary(userId);
      
      return {
        success: true,
        message: result.message,
        data: {
          updatedCount: result.updatedCount,
          summary
        }
      };
    } catch (error) {
      console.error('批量更新购物车商品选中状态失败:', error);
      return {
        success: false,
        message: error.message || '批量更新购物车商品选中状态失败',
        error: error.message
      };
    }
  }

  /**
   * 删除购物车商品
   * @param {number} userId - 用户ID
   * @param {number} cartId - 购物车项ID
   * @returns {Promise<Object>} - 操作结果
   */
  static async removeFromCart(userId, cartId) {
    try {
      if (!cartId) {
        throw new Error('购物车项ID不能为空');
      }

      const result = await Cart.removeFromCart(userId, cartId);
      
      // 获取更新后的购物车统计
      const summary = await Cart.getCartPointsSummary(userId);
      
      return {
        success: true,
        message: result.message,
        data: {
          summary
        }
      };
    } catch (error) {
      console.error('删除购物车商品失败:', error);
      return {
        success: false,
        message: error.message || '删除购物车商品失败',
        error: error.message
      };
    }
  }

  /**
   * 批量删除购物车商品
   * @param {number} userId - 用户ID
   * @param {Array<number>} cartIds - 购物车项ID数组
   * @returns {Promise<Object>} - 操作结果
   */
  static async batchRemoveFromCart(userId, cartIds) {
    try {
      if (!cartIds || !Array.isArray(cartIds)) {
        throw new Error('购物车项ID数组不能为空');
      }

      const result = await Cart.batchRemoveFromCart(userId, cartIds);
      
      // 获取更新后的购物车统计
      const summary = await Cart.getCartPointsSummary(userId);
      
      return {
        success: true,
        message: result.message,
        data: {
          deletedCount: result.deletedCount,
          summary
        }
      };
    } catch (error) {
      console.error('批量删除购物车商品失败:', error);
      return {
        success: false,
        message: error.message || '批量删除购物车商品失败',
        error: error.message
      };
    }
  }

  /**
   * 清空购物车
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 操作结果
   */
  static async clearCart(userId) {
    try {
      const result = await Cart.clearCart(userId);
      
      return {
        success: true,
        message: result.message,
        data: {
          deletedCount: result.deletedCount,
          summary: {
            selectedCount: 0,
            totalPoints: 0,
            totalQuantity: 0
          }
        }
      };
    } catch (error) {
      console.error('清空购物车失败:', error);
      return {
        success: false,
        message: error.message || '清空购物车失败',
        error: error.message
      };
    }
  }

  /**
   * 获取购物车统计信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 统计信息
   */
  static async getCartSummary(userId) {
    try {
      const cartCount = await Cart.getCartCount(userId);
      const pointsSummary = await Cart.getCartPointsSummary(userId);
      
      return {
        success: true,
        data: {
          ...cartCount,
          ...pointsSummary
        }
      };
    } catch (error) {
      console.error('获取购物车统计信息失败:', error);
      return {
        success: false,
        message: error.message || '获取购物车统计信息失败',
        error: error.message
      };
    }
  }

  /**
   * 获取选中的购物车商品（用于下单）
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 选中的购物车商品
   */
  static async getSelectedItems(userId) {
    try {
      const allCartItems = await Cart.getCartByUserId(userId);
      const selectedItems = allCartItems.filter(item => item.is_selected);
      
      if (selectedItems.length === 0) {
        throw new Error('没有选中的商品');
      }

      // 计算总积分
      const totalPoints = selectedItems.reduce((sum, item) => {
        return sum + (item.quantity * item.points_required);
      }, 0);

      return {
        success: true,
        data: {
          items: selectedItems,
          totalPoints
        }
      };
    } catch (error) {
      console.error('获取选中的购物车商品失败:', error);
      return {
        success: false,
        message: error.message || '获取选中的购物车商品失败',
        error: error.message
      };
    }
  }
}

module.exports = CartService;