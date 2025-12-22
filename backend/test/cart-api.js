const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let userToken = '';
let testCartId = null;

// 测试数据
const testUser = {
  username: 'user1',
  password: 'password1'
};

// 测试商品数据
const testProducts = [
  { productId: 1, quantity: 2 },  // 智能手机
  { productId: 2, quantity: 1 },  // 蓝牙耳机
  { productId: 3, quantity: 3 }   // 保温杯
];

// 获取用户token
async function getUserToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password,
      type: 'user'
    });
    
    if (response.data.success) {
      userToken = response.data.token;
      console.log('✅ 用户登录成功');
      return true;
    } else {
      console.error('❌ 用户登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 用户登录失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 获取购物车列表
async function getCart() {
  try {
    const response = await axios.get(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ 获取购物车成功');
      console.log('购物车商品数量:', response.data.data.cartItems.length);
      console.log('购物车统计信息:', response.data.data.summary);
      return response.data;
    } else {
      console.error('❌ 获取购物车失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取购物车失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 添加商品到购物车
async function addToCart(productId, quantity) {
  try {
    const response = await axios.post(`${BASE_URL}/cart`, {
      productId,
      quantity
    }, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log(`✅ 添加商品(ID: ${productId})到购物车成功，数量: ${quantity}`);
      return response.data;
    } else {
      console.error(`❌ 添加商品(ID: ${productId})到购物车失败:`, response.data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ 添加商品(ID: ${productId})到购物车失败:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 更新购物车商品数量
async function updateCartQuantity(cartId, quantity) {
  try {
    const response = await axios.put(`${BASE_URL}/cart/${cartId}`, {
      quantity
    }, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log(`✅ 更新购物车商品(ID: ${cartId})数量成功，新数量: ${quantity}`);
      return response.data;
    } else {
      console.error(`❌ 更新购物车商品(ID: ${cartId})数量失败:`, response.data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ 更新购物车商品(ID: ${cartId})数量失败:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 更新购物车商品选中状态
async function updateCartSelection(cartId, isSelected) {
  try {
    const response = await axios.put(`${BASE_URL}/cart/${cartId}/selection`, {
      isSelected
    }, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log(`✅ 更新购物车商品(ID: ${cartId})选中状态成功，状态: ${isSelected ? '选中' : '未选中'}`);
      return response.data;
    } else {
      console.error(`❌ 更新购物车商品(ID: ${cartId})选中状态失败:`, response.data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ 更新购物车商品(ID: ${cartId})选中状态失败:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 批量更新购物车商品选中状态
async function batchUpdateCartSelection(cartIds, isSelected) {
  try {
    const response = await axios.put(`${BASE_URL}/cart/batch-update-selection`, {
      cartIds,
      isSelected
    }, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log(`✅ 批量更新购物车商品选中状态成功，状态: ${isSelected ? '选中' : '未选中'}`);
      console.log(`更新了 ${response.data.data.updatedCount} 个商品`);
      return response.data;
    } else {
      console.error('❌ 批量更新购物车商品选中状态失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 批量更新购物车商品选中状态失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 删除购物车商品
async function removeFromCart(cartId) {
  try {
    const response = await axios.delete(`${BASE_URL}/cart/${cartId}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log(`✅ 删除购物车商品(ID: ${cartId})成功`);
      return response.data;
    } else {
      console.error(`❌ 删除购物车商品(ID: ${cartId})失败:`, response.data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ 删除购物车商品(ID: ${cartId})失败:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 批量删除购物车商品
async function batchRemoveFromCart(cartIds) {
  try {
    const response = await axios.delete(`${BASE_URL}/cart/batch-remove`, {
      data: { cartIds }
    }, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log(`✅ 批量删除购物车商品成功`);
      console.log(`删除了 ${response.data.data.deletedCount} 个商品`);
      return response.data;
    } else {
      console.error('❌ 批量删除购物车商品失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 批量删除购物车商品失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 清空购物车
async function clearCart() {
  try {
    const response = await axios.delete(`${BASE_URL}/cart/clear`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log(`✅ 清空购物车成功`);
      return response.data;
    } else {
      console.error('❌ 清空购物车失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 清空购物车失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 获取购物车统计信息
async function getCartSummary() {
  try {
    const response = await axios.get(`${BASE_URL}/cart/summary`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ 获取购物车统计信息成功');
      console.log('统计信息:', response.data.data);
      return response.data;
    } else {
      console.error('❌ 获取购物车统计信息失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取购物车统计信息失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 获取选中的购物车商品（用于下单）
async function getSelectedItems() {
  try {
    const response = await axios.get(`${BASE_URL}/cart/selected`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ 获取选中商品成功');
      console.log('选中商品数量:', response.data.data.items.length);
      console.log('总积分:', response.data.data.totalPoints);
      return response.data;
    } else {
      console.error('❌ 获取选中商品失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取选中商品失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('🧪 开始购物车API测试...\n');
  
  // 1. 登录获取token
  console.log('\n🔐 步骤 1: 用户登录');
  const loginSuccess = await getUserToken();
  if (!loginSuccess) {
    console.log('❌ 测试失败: 无法获取用户token');
    return;
  }
  
  // 2. 获取初始购物车
  console.log('\n🛒 步骤 2: 获取初始购物车');
  await getCart();
  await getCartSummary();
  
  // 3. 添加商品到购物车
  console.log('\n➕ 步骤 3: 添加商品到购物车');
  for (const product of testProducts) {
    await addToCart(product.productId, product.quantity);
  }
  
  // 4. 获取更新后的购物车
  console.log('\n🛒 步骤 4: 获取更新后的购物车');
  const updatedCart = await getCart();
  await getCartSummary();
  
  // 5. 获取购物车中的第一个商品ID，用于后续测试
  if (updatedCart && updatedCart.data.cartItems.length > 0) {
    testCartId = updatedCart.data.cartItems[0].id;
    
    // 6. 更新商品数量
    console.log('\n🔄 步骤 5: 更新商品数量');
    await updateCartQuantity(testCartId, 5);
    await getCartSummary();
    
    // 7. 更新商品选中状态
    console.log('\n✅ 步骤 6: 更新商品选中状态');
    await updateCartSelection(testCartId, false);
    await getCartSummary();
    await updateCartSelection(testCartId, true);
    await getCartSummary();
    
    // 8. 获取所有购物车商品ID，用于批量操作
    const cartIds = updatedCart.data.cartItems.map(item => item.id);
    
    // 9. 批量更新选中状态
    console.log('\n✅✅ 步骤 7: 批量更新选中状态');
    await batchUpdateCartSelection(cartIds, false);
    await getCartSummary();
    await batchUpdateCartSelection(cartIds, true);
    await getCartSummary();
    
    // 10. 获取选中的商品
    console.log('\n📦 步骤 8: 获取选中的商品');
    await getSelectedItems();
    
    // 11. 删除单个商品
    console.log('\n🗑️ 步骤 9: 删除单个商品');
    await removeFromCart(testCartId);
    await getCart();
    await getCartSummary();
    
    // 12. 删除剩余商品
    const remainingCart = await getCart();
    if (remainingCart && remainingCart.data.cartItems.length > 0) {
      const remainingIds = remainingCart.data.cartItems.map(item => item.id);
      
      // 13. 批量删除商品
      console.log('\n🗑️🗑️ 步骤 10: 批量删除商品');
      await batchRemoveFromCart(remainingIds);
      await getCart();
      await getCartSummary();
    }
  }
  
  // 14. 重新添加一些商品，然后清空购物车
  console.log('\n➕🗑️ 步骤 11: 重新添加商品并清空购物车');
  await addToCart(testProducts[0].productId, testProducts[0].quantity);
  await addToCart(testProducts[1].productId, testProducts[1].quantity);
  await getCart();
  await getCartSummary();
  await clearCart();
  await getCart();
  await getCartSummary();
  
  console.log('\n🎉 购物车API测试完成！');
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试运行出错:', error);
  process.exit(1);
});