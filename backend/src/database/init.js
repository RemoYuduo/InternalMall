const fs = require('fs');
const path = require('path');
const { db } = require('../config/database');

// 确保数据库目录存在
const ensureDatabaseDir = () => {
  const dbDir = path.join(__dirname, '../../database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
};

// 创建数据库表
const createTables = async () => {
  return new Promise((resolve, reject) => {
    // 用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        points INTEGER DEFAULT 0,
        role TEXT DEFAULT 'user',
        department TEXT,
        position TEXT,
        avatar TEXT,
        status TEXT DEFAULT 'active',
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      )
    `, (err) => {
      if (err) {
        console.error('创建用户表失败:', err);
        return reject(err);
      }
      
      // 商品分类表
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          sort INTEGER DEFAULT 0,
          icon TEXT,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME
        )
      `, (err) => {
        if (err) {
          console.error('创建商品分类表失败:', err);
          return reject(err);
        }
        
        // 商品表
        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            specifications TEXT,
            price REAL NOT NULL,
            points_required INTEGER NOT NULL,
            stock INTEGER DEFAULT 0,
            warning_stock INTEGER DEFAULT 10,
            images TEXT,
            status TEXT DEFAULT 'active',
            category_id INTEGER,
            sales INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            favorites INTEGER DEFAULT 0,
            exchange_rules TEXT,
            sort INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            deleted_at DATETIME,
            FOREIGN KEY (category_id) REFERENCES categories (id)
          )
        `, (err) => {
          if (err) {
            console.error('创建商品表失败:', err);
            return reject(err);
          }
          
          // 收货地址表
          db.run(`
            CREATE TABLE IF NOT EXISTS addresses (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              recipient_name TEXT NOT NULL,
              phone TEXT NOT NULL,
              province TEXT NOT NULL,
              city TEXT NOT NULL,
              district TEXT NOT NULL,
              address TEXT NOT NULL,
              is_default INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              deleted_at DATETIME,
              FOREIGN KEY (user_id) REFERENCES users (id)
            )
          `, (err) => {
            if (err) {
              console.error('创建收货地址表失败:', err);
              return reject(err);
            }
            
            // 购物车表
            db.run(`
              CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                is_selected INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (product_id) REFERENCES products (id),
                UNIQUE(user_id, product_id)
              )
            `, (err) => {
              if (err) {
                console.error('创建购物车表失败:', err);
                return reject(err);
              }
              
              // 订单表
              db.run(`
                CREATE TABLE IF NOT EXISTS orders (
                  id TEXT PRIMARY KEY,
                  user_id INTEGER NOT NULL,
                  total_points INTEGER NOT NULL,
                  status TEXT DEFAULT 'pending',
                  shipping_address TEXT NOT NULL,
                  remark TEXT,
                  cancelled_at DATETIME,
                  completed_at DATETIME,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  deleted_at DATETIME,
                  FOREIGN KEY (user_id) REFERENCES users (id)
                )
              `, (err) => {
                if (err) {
                  console.error('创建订单表失败:', err);
                  return reject(err);
                }
                
                // 订单明细表
                db.run(`
                  CREATE TABLE IF NOT EXISTS order_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id TEXT NOT NULL,
                    product_id INTEGER NOT NULL,
                    product_name TEXT NOT NULL,
                    product_image TEXT,
                    quantity INTEGER NOT NULL,
                    points_required INTEGER NOT NULL,
                    total_points INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES orders (id),
                    FOREIGN KEY (product_id) REFERENCES products (id)
                  )
                `, (err) => {
                  if (err) {
                    console.error('创建订单明细表失败:', err);
                    return reject(err);
                  }
                  
                  // 积分记录表
                  db.run(`
                    CREATE TABLE IF NOT EXISTS points_history (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      user_id INTEGER NOT NULL,
                      points_change INTEGER NOT NULL,
                      type TEXT NOT NULL,
                      description TEXT,
                      reference_id TEXT,
                      reference_type TEXT,
                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                  `, (err) => {
                    if (err) {
                      console.error('创建积分记录表失败:', err);
                      return reject(err);
                    }
                    
                    // 商品收藏表
                    db.run(`
                      CREATE TABLE IF NOT EXISTS favorites (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        product_id INTEGER NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id),
                        FOREIGN KEY (product_id) REFERENCES products (id),
                        UNIQUE(user_id, product_id)
                      )
                    `, (err) => {
                      if (err) {
                        console.error('创建商品收藏表失败:', err);
                        return reject(err);
                      }
                      
                      // 系统配置表
                      db.run(`
                        CREATE TABLE IF NOT EXISTS system_configs (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          key TEXT UNIQUE NOT NULL,
                          value TEXT,
                          description TEXT,
                          type TEXT DEFAULT 'string',
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                      `, (err) => {
                        if (err) {
                          console.error('创建系统配置表失败:', err);
                          return reject(err);
                        }
                        
                        // 用户签到表
                        db.run(`
                          CREATE TABLE IF NOT EXISTS checkins (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            checkin_date DATE NOT NULL,
                            points_earned INTEGER NOT NULL DEFAULT 10,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users (id),
                            UNIQUE(user_id, checkin_date)
                          )
                        `, (err) => {
                          if (err) {
                            console.error('创建用户签到表失败:', err);
                            return reject(err);
                          }
                          
                          console.log('数据库表创建成功');
                          resolve();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// 插入初始数据
const insertInitialData = async () => {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');
    
    // 插入测试用户
    const users = [
      { username: 'user1', password: 'password1', role: 'user', points: 100, email: 'user1@example.com', department: '技术部', position: '软件工程师' },
      { username: 'user2', password: 'password2', role: 'user', points: 200, email: 'user2@example.com', department: '市场部', position: '市场专员' },
      { username: 'user3', password: 'password3', role: 'user', points: 150, email: 'user3@example.com', department: '人事部', position: '人事专员' },
      { username: 'admin', password: 'admin123', role: 'admin', points: 0, email: 'admin@example.com', department: 'IT部', position: '系统管理员' }
    ];
    
    let userInsertCount = 0;
    
    users.forEach((user, index) => {
      bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
          console.error('密码加密失败:', err);
          return reject(err);
        }
        
        db.run(`
          INSERT OR IGNORE INTO users (username, password, role, points, email, department, position) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [user.username, hash, user.role, user.points, user.email, user.department, user.position], (err) => {
          if (err) {
            console.error('插入用户失败:', err);
            return reject(err);
          }
          
          userInsertCount++;
          if (userInsertCount === users.length) {
            console.log('初始用户数据插入成功');
            
            // 插入商品分类
            const categories = [
              { name: '电子产品', description: '各类电子设备', sort: 1 },
              { name: '生活用品', description: '日常生活用品', sort: 2 },
              { name: '办公用品', description: '办公相关用品', sort: 3 },
              { name: '运动健康', description: '运动健康相关产品', sort: 4 },
              { name: '图书音像', description: '图书和音像制品', sort: 5 }
            ];
            
            let categoryInsertCount = 0;
            
            categories.forEach((category) => {
              db.run(`
                INSERT OR IGNORE INTO categories (name, description, sort) 
                VALUES (?, ?, ?)
              `, [category.name, category.description, category.sort], (err) => {
                if (err) {
                  console.error('插入分类失败:', err);
                  return reject(err);
                }
                
                categoryInsertCount++;
                if (categoryInsertCount === categories.length) {
                  console.log('初始分类数据插入成功');
                  
                  // 插入商品数据
                  const products = [
                    {
                      name: '智能手机',
                      description: '高性能智能手机，拥有优秀的拍照功能和长续航',
                      price: 1999.00,
                      pointsRequired: 100,
                      stock: 50,
                      categoryId: 1,
                      specifications: '{"screen": "6.5英寸", "cpu": "八核处理器", "ram": "8GB", "storage": "128GB", "camera": "4800万像素"}',
                      exchangeRules: '每人限兑1台'
                    },
                    {
                      name: '蓝牙耳机',
                      description: '无线蓝牙耳机，音质清晰，佩戴舒适',
                      price: 299.00,
                      pointsRequired: 30,
                      stock: 100,
                      categoryId: 1,
                      specifications: '{"battery": "24小时续航", "connection": "蓝牙5.0", "waterproof": "IPX5防水"}',
                      exchangeRules: '每人限兑2个'
                    },
                    {
                      name: '保温杯',
                      description: '304不锈钢保温杯，保冷保温效果佳',
                      price: 99.00,
                      pointsRequired: 10,
                      stock: 200,
                      categoryId: 2,
                      specifications: '{"capacity": "500ml", "material": "304不锈钢", "temperature": "保温12小时，保冷24小时"}',
                      exchangeRules: '不限数量'
                    },
                    {
                      name: '笔记本',
                      description: '高品质办公笔记本，书写流畅',
                      price: 19.90,
                      pointsRequired: 5,
                      stock: 500,
                      categoryId: 3,
                      specifications: '{"pages": 100, "size": "A5", "type": "线圈装订"}',
                      exchangeRules: '不限数量'
                    },
                    {
                      name: '瑜伽垫',
                      description: '防滑瑜伽垫，舒适环保',
                      price: 129.00,
                      pointsRequired: 25,
                      stock: 80,
                      categoryId: 4,
                      specifications: '{"thickness": "6mm", "material": "TPE环保材料", "size": "183cm x 61cm"}',
                      exchangeRules: '每人限兑1个'
                    },
                    {
                      name: '编程书籍',
                      description: 'JavaScript高级程序设计，前端开发必读',
                      price: 89.00,
                      pointsRequired: 15,
                      stock: 30,
                      categoryId: 5,
                      specifications: '{"pages": 720, "author": "Nicholas C. Zakas", "publisher": "人民邮电出版社"}',
                      exchangeRules: '每人限兑1本'
                    }
                  ];
                  
                  let productInsertCount = 0;
                  
                  products.forEach((product) => {
                    db.run(`
                      INSERT OR IGNORE INTO products (
                        name, description, price, points_required, stock, category_id, 
                        specifications, exchange_rules, images
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                      product.name, 
                      product.description, 
                      product.price, 
                      product.pointsRequired, 
                      product.stock, 
                      product.categoryId,
                      product.specifications,
                      product.exchangeRules,
                      '[]'
                    ], (err) => {
                      if (err) {
                        console.error('插入商品失败:', err);
                        return reject(err);
                      }
                      
                      productInsertCount++;
                      if (productInsertCount === products.length) {
                        console.log('初始商品数据插入成功');
                        
                        // 插入系统配置
                        const configs = [
                          { key: 'system.name', value: '企业内部福利商城', description: '系统名称', type: 'string' },
                          { key: 'system.logo', value: '', description: '系统Logo', type: 'string' },
                          { key: 'points.daily_checkin', value: '10', description: '每日签到积分', type: 'number' },
                          { key: 'points.new_user', value: '100', description: '新用户注册积分', type: 'number' },
                          { key: 'announcement.enabled', value: 'false', description: '是否启用公告', type: 'boolean' },
                          { key: 'announcement.title', value: '', description: '公告标题', type: 'string' },
                          { key: 'announcement.content', value: '', description: '公告内容', type: 'string' }
                        ];
                        
                        let configInsertCount = 0;
                        
                        configs.forEach((config) => {
                          db.run(`
                            INSERT OR IGNORE INTO system_configs (key, value, description, type) 
                            VALUES (?, ?, ?, ?)
                          `, [config.key, config.value, config.description, config.type], (err) => {
                            if (err) {
                              console.error('插入系统配置失败:', err);
                              return reject(err);
                            }
                            
                            configInsertCount++;
                            if (configInsertCount === configs.length) {
                              console.log('初始系统配置数据插入成功');
                              resolve();
                            }
                          });
                        });
                      }
                    });
                  });
                }
              });
            });
          }
        });
      });
    });
  });
};

// 初始化数据库
const initDatabase = async () => {
  try {
    // 确保数据库目录存在
    ensureDatabaseDir();
    
    // 创建表
    await createTables();
    
    // 插入初始数据
    await insertInitialData();
    
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

module.exports = {
  initDatabase
};