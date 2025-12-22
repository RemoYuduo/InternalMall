@echo off
title 预览企业内部福利商城前端

echo 正在预览企业内部福利商城前端应用...
echo.

:: 检查前端服务是否已启动
netstat -ano | findstr :5173 > nul
if %ERRORLEVEL% EQU 0 (
    echo 前端服务已运行，正在打开浏览器...
    start http://localhost:5173
    echo 前端页面已在浏览器中打开
    pause
    exit /b 0
)

:: 检查后端服务是否已启动
netstat -ano | findstr :3001 > nul
if %ERRORLEVEL% NEQ 0 (
    echo 后端服务未启动，正在先启动后端服务...
    cd /d "%~dp0backend"
    start "企业商城后端服务" cmd /k "npm run dev"
    
    echo 等待后端服务启动...
    timeout /t 8 /nobreak > nul
)

:: 启动前端服务
echo 正在启动前端服务...
cd /d "%~dp0frontend"
start "企业商城前端服务" cmd /k "npm run dev"

echo 等待前端服务启动...
timeout /t 5 /nobreak > nul

:: 打开浏览器
echo 正在打开浏览器...
start http://localhost:5173

echo.
echo 前端应用已在浏览器中打开
echo.
echo 测试账号:
echo 普通用户: user1/password1, user2/password2, user3/password3
echo 管理员: admin/admin123
echo.
echo 按任意键退出...
pause