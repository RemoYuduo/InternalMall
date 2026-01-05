# 企业内部福利商城

基于Vue 3和Express.js的企业内部福利商城系统。

## 项目结构

```
InternalEnterpriseMall/
├── backend/                # 后端服务
│   ├── src/               # 源代码
│   ├── package.json       # 依赖配置
│   ├── server.js          # 入口文件
│   └── .env               # 环境变量
├── frontend/              # 前端应用
│   ├── src/               # 源代码
│   ├── package.json       # 依赖配置
│   ├── vite.config.js     # Vite配置
│   └── index.html         # HTML模板
├── spec/                  # 项目规范文档
│   ├── Me2AI/             # 用户需求文档
│   └── AI2AI/             # AI维护的架构文档
├── start-services.bat      # 快速启动服务脚本
├── preview-frontend.bat    # 前端预览脚本
├── stop-services.bat       # 停止服务脚本
└── README.md              # 项目说明
```

## 快速启动

### 方法1：使用批处理脚本（推荐）

#### 启动所有服务
双击运行 `start-services.bat` 文件，该脚本会：
1. 检查并停止可能占用端口的进程
2. 启动后端服务（端口3001）
3. 启动前端服务（端口5173）
4. 自动打开浏览器访问前端应用

#### 仅预览前端
双击运行 `preview-frontend.bat` 文件，该脚本会：
1. 检查服务状态
2. 如果需要，启动后端服务
3. 启动前端服务
4. 打开浏览器访问前端应用

#### 停止所有服务
双击运行 `stop-services.bat` 文件，该脚本会：
1. 停止后端服务进程
2. 停止前端服务进程

### 方法2：手动启动

#### 后端启动
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

后端服务将在 `http://localhost:3001` 启动。

#### 前端启动
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 `http://localhost:5173` 启动。

## 连通性测试

1. 打开浏览器访问 `http://localhost:5173`
2. 点击"服务连通性测试"按钮
3. 在连通性测试页面中，可以进行以下测试：
   - 基础连通性测试
   - 数据库连通性测试
   - 用户登录测试
   - 用户接口测试
   - 管理员接口测试

## 测试账号

系统已预置以下测试账号：

### 普通用户账号
- 用户名: `user1`，密码: `password1`，积分: 100
- 用户名: `user2`，密码: `password2`，积分: 200
- 用户名: `user3`，密码: `password3`，积分: 150

### 管理员账号
- 用户名: `admin`，密码: `admin123`，角色: 管理员

## 当前功能状态

- ✅ 后端基础框架搭建
- ✅ 数据库初始化和表结构创建
- ✅ 用户认证和JWT令牌
- ✅ 基础API接口实现
- ✅ 前端基础框架搭建
- ✅ 连通性测试页面
- ✅ 快速启动脚本
- ⏳ 完整用户功能实现
- ⏳ 完整管理员功能实现
- ⏳ 商品管理功能
- ⏳ 订单管理功能
- ⏳ 购物车功能

## 技术栈

### 后端
- Node.js
- Express.js
- SQLite3
- JWT认证
- Bcrypt密码加密

### 前端
- Vue 3
- Element Plus UI组件库
- Vue Router
- Pinia状态管理
- Axios HTTP客户端
- Vite构建工具

## API文档

详细的API文档请参考 `spec/AI2AI/协议和数据.md`

## 项目规范

项目采用双层Spec驱动的开发方式：

1. **Me2AI**: 用户需求和技术约束文档，由人工维护
2. **AI2AI**: 架构和实现状态文档，由AI维护

所有规范文档存放在 `./spec` 文件夹下。