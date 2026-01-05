const CartService = require('../services/cartService');
const { successResponse, errorResponse } = require('../utils/response');

class CartController {
  /**
   * 获取用户购物车列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getCart(req, res) {
    try {
      const userId = req.user.id;
      const result = await CartService.getCartItems(userId);
      
      if (result.success) {
        return successResponse(res, result.message || '获取购物车成功', {
          cartItems: result.cartItems,
          summary: result.summary
        });
      } else {
        return errorResponse(res, result.message, 'CART_001');
      }
    } catch (error) {
      console.error('获取购物车失败:', error);
      return errorResponse(res, '获取购物车失败', 'SYS_001', error.message);
    }
  }

  /**
   * 添加商品到购物车
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return errorResponse(res, '商品ID不能为空', 'CART_002');
      }
      
      if (!Number.isInteger(productId) || productId <= 0) {
        return errorResponse(res, '商品ID必须为正整数', 'CART_003');
      }
      
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return errorResponse(res, '数量必须为正整数', 'CART_004');
      }
      
      const result = await CartService.addToCart(userId, productId, quantity);
      
      if (result.success) {
        return successResponse(res, result.message, result.data);
      } else {
        return errorResponse(res, result.message, 'CART_005');
      }
    } catch (error) {
      console.error('添加商品到购物车失败:', error);
      return errorResponse(res, '添加商品到购物车失败', 'SYS_001', error.message);
    }
  }

  /**
   * 更新购物车商品数量
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async updateQuantity(req, res) {
    try {
      const userId = req.user.id;
      const { cartId } = req.params;
      const { quantity } = req.body;
      
      if (!cartId || !Number.isInteger(parseInt(cartId))) {
        return errorResponse(res, '购物车项ID必须为正整数', 'CART_006');
      }
      
      if (!quantity || !Number.isInteger(quantity) || quantity <= 0) {
        return errorResponse(res, '数量必须为正整数', 'CART_007');
      }
      
      const result = await CartService.updateItemQuantity(userId, parseInt(cartId), quantity);
      
      if (result.success) {
        return successResponse(res, result.message, result.data);
      } else {
        return errorResponse(res, result.message, 'CART_008');
      }
    } catch (error) {
      console.error('更新购物车商品数量失败:', error);
      return errorResponse(res, '更新购物车商品数量失败', 'SYS_001', error.message);
    }
  }

  /**
   * 更新购物车商品选中状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async updateSelectedStatus(req, res) {
    try {
      const userId = req.user.id;
      const { cartId } = req.params;
      const { isSelected } = req.body;
      
      if (!cartId || !Number.isInteger(parseInt(cartId))) {
        return errorResponse(res, '购物车项ID必须为正整数', 'CART_009');
      }
      
      if (typeof isSelected !== 'boolean') {
        return errorResponse(res, '选中状态必须为布尔值', 'CART_010');
      }
      
      const result = await CartService.updateItemSelection(userId, parseInt(cartId), isSelected);
      
      if (result.success) {
        return successResponse(res, result.message, result.data);
      } else {
        return errorResponse(res, result.message, 'CART_011');
      }
    } catch (error) {
      console.error('更新购物车商品选中状态失败:', error);
      return errorResponse(res, '更新购物车商品选中状态失败', 'SYS_001', error.message);
    }
  }

  /**
   * 批量更新购物车商品选中状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async updateMultipleSelectedStatus(req, res) {
    try {
      const userId = req.user.id;
      const { cartIds, isSelected } = req.body;
      
      if (!Array.isArray(cartIds) || cartIds.length === 0) {
        return errorResponse(res, '购物车项ID数组不能为空', 'CART_012');
      }
      
      // 验证所有ID都是正整数
      for (const id of cartIds) {
        if (!Number.isInteger(parseInt(id))) {
          return errorResponse(res, '购物车项ID必须为正整数', 'CART_013');
        }
      }
      
      if (typeof isSelected !== 'boolean') {
        return errorResponse(res, '选中状态必须为布尔值', 'CART_014');
      }
      
      // 转换为整数数组
      const intCartIds = cartIds.map(id => parseInt(id));
      
      const result = await CartService.updateMultipleItemsSelection(userId, intCartIds, isSelected);
      
      if (result.success) {
        return successResponse(res, result.message, result.data);
      } else {
        return errorResponse(res, result.message, 'CART_015');
      }
    } catch (error) {
      console.error('批量更新购物车商品选中状态失败:', error);
      return errorResponse(res, '批量更新购物车商品选中状态失败', 'SYS_001', error.message);
    }
  }

  /**
   * 删除购物车商品
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async removeFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { cartId } = req.params;
      
      if (!cartId || !Number.isInteger(parseInt(cartId))) {
        return errorResponse(res, '购物车项ID必须为正整数', 'CART_016');
      }
      
      const result = await CartService.removeFromCart(userId, parseInt(cartId));
      
      if (result.success) {
        return successResponse(res, result.message, result.data);
      } else {
        return errorResponse(res, result.message, 'CART_017');
      }
    } catch (error) {
      console.error('删除购物车商品失败:', error);
      return errorResponse(res, '删除购物车商品失败', 'SYS_001', error.message);
    }
  }

  /**
   * 批量删除购物车商品
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async batchRemoveFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { cartIds } = req.body;
      
      if (!Array.isArray(cartIds) || cartIds.length === 0) {
        return errorResponse(res, '购物车项ID数组不能为空', 'CART_018');
      }
      
      // 验证所有ID都是正整数
      for (const id of cartIds) {
        if (!Number.isInteger(parseInt(id))) {
          return errorResponse(res, '购物车项ID必须为正整数', 'CART_019');
        }
      }
      
      // 转换为整数数组
      const intCartIds = cartIds.map(id => parseInt(id));
      
      const result = await CartService.batchRemoveFromCart(userId, intCartIds);
      
      if (result.success) {
        return successResponse(res, result.message, result.data);
      } else {
        return errorResponse(res, result.message, 'CART_020');
      }
    } catch (error) {
      console.error('批量删除购物车商品失败:', error);
      return errorResponse(res, '批量删除购物车商品失败', 'SYS_001', error.message);
    }
  }

  /**
   * 清空购物车
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async clearCart(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await CartService.clearCart(userId);
      
      if (result.success) {
        return successResponse(res, result.message, result.data);
      } else {
        return errorResponse(res, result.message, 'CART_021');
      }
    } catch (error) {
      console.error('清空购物车失败:', error);
      return errorResponse(res, '清空购物车失败', 'SYS_001', error.message);
    }
  }

  /**
   * 获取购物车统计信息
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getCartSummary(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await CartService.getCartSummary(userId);
      
      if (result.success) {
        return successResponse(res, '获取购物车统计信息成功', result.data);
      } else {
        return errorResponse(res, result.message, 'CART_022');
      }
    } catch (error) {
      console.error('获取购物车统计信息失败:', error);
      return errorResponse(res, '获取购物车统计信息失败', 'SYS_001', error.message);
    }
  }

  /**
   * 获取选中的购物车商品（用于下单）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getSelectedItems(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await CartService.getSelectedItems(userId);
      
      if (result.success) {
        return successResponse(res, '获取选中商品成功', result.data);
      } else {
        return errorResponse(res, result.message, 'CART_023');
      }
    } catch (error) {
      console.error('获取选中的购物车商品失败:', error);
      return errorResponse(res, '获取选中的购物车商品失败', 'SYS_001', error.message);
    }
  }
}

module.exports = CartController;