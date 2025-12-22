import { ref, computed } from 'vue';
import { 
  getCart, 
  addToCart, 
  updateCartQuantity, 
  updateCartSelection,
  batchUpdateCartSelection,
  removeFromCart,
  batchRemoveFromCart,
  clearCart,
  getCartSummary
} from '@/api/cart';

const cartItems = ref([]);
const cartSummary = ref({
  selectedCount: 0,
  totalPoints: 0,
  totalQuantity: 0
});
const loading = ref(false);

// 计算属性
const totalCount = computed(() => cartItems.value.length);
const selectedItems = computed(() => cartItems.value.filter(item => item.is_selected));
const allSelected = computed(() => totalCount.value > 0 && selectedItems.value.length === totalCount.value);

// 获取购物车数据
const fetchCart = async () => {
  loading.value = true;
  try {
    const response = await getCart();
    if (response.success) {
      cartItems.value = response.message.cartItems || [];
      cartSummary.value = response.message.summary || {
        selectedCount: 0,
        totalPoints: 0,
        totalQuantity: 0
      };
    }
  } catch (error) {
    console.error('获取购物车失败:', error);
  } finally {
    loading.value = false;
  }
};

// 添加商品到购物车
const addProductToCart = async (productId, quantity = 1) => {
  loading.value = true;
  try {
    const response = await addToCart({ productId, quantity });
    if (response.success) {
      // 更新购物车数据
      await fetchCart();
      return true;
    }
    return false;
  } catch (error) {
    console.error('添加商品到购物车失败:', error);
    return false;
  } finally {
    loading.value = false;
  }
};

// 更新商品数量
const updateQuantity = async (cartId, quantity) => {
  loading.value = true;
  try {
    const response = await updateCartQuantity(cartId, { quantity });
    if (response.success) {
      // 更新购物车数据
      await fetchCart();
      return true;
    }
    return false;
  } catch (error) {
    console.error('更新购物车商品数量失败:', error);
    return false;
  } finally {
    loading.value = false;
  }
};

// 更新商品选中状态
const updateSelection = async (cartId, isSelected) => {
  loading.value = true;
  try {
    const response = await updateCartSelection(cartId, { isSelected });
    if (response.success) {
      // 更新购物车数据
      await fetchCart();
      return true;
    }
    return false;
  } catch (error) {
    console.error('更新购物车商品选中状态失败:', error);
    return false;
  } finally {
    loading.value = false;
  }
};

// 批量更新选中状态
const batchUpdateSelection = async (isSelected) => {
  loading.value = true;
  try {
    const cartIds = cartItems.value.map(item => item.id);
    const response = await batchUpdateCartSelection({ cartIds, isSelected });
    if (response.success) {
      // 更新购物车数据
      await fetchCart();
      return true;
    }
    return false;
  } catch (error) {
    console.error('批量更新购物车商品选中状态失败:', error);
    return false;
  } finally {
    loading.value = false;
  }
};

// 删除购物车商品
const removeItem = async (cartId) => {
  loading.value = true;
  try {
    const response = await removeFromCart(cartId);
    if (response.success) {
      // 更新购物车数据
      await fetchCart();
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    return false;
  } finally {
    loading.value = false;
  }
};

// 批量删除选中的商品
const removeSelectedItems = async () => {
  loading.value = true;
  try {
    const selectedCartIds = selectedItems.value.map(item => item.id);
    if (selectedCartIds.length === 0) return false;
    
    const response = await batchRemoveFromCart({ cartIds: selectedCartIds });
    if (response.success) {
      // 更新购物车数据
      await fetchCart();
      return true;
    }
    return false;
  } catch (error) {
    console.error('批量删除购物车商品失败:', error);
    return false;
  } finally {
    loading.value = false;
  }
};

// 清空购物车
const clearCartItems = async () => {
  loading.value = true;
  try {
    const response = await clearCart();
    if (response.success) {
      // 更新购物车数据
      await fetchCart();
      return true;
    }
    return false;
  } catch (error) {
    console.error('清空购物车失败:', error);
    return false;
  } finally {
    loading.value = false;
  }
};

// 初始化购物车
const initCart = () => {
  fetchCart();
};

export {
  cartItems,
  cartSummary,
  loading,
  totalCount,
  selectedItems,
  allSelected,
  fetchCart,
  addProductToCart,
  updateQuantity,
  updateSelection,
  batchUpdateSelection,
  removeItem,
  removeSelectedItems,
  clearCartItems,
  initCart
};