@echo off
chcp 65001 >nul
title 启动预览

echo [启动企业内部福利商城]
echo.

:: 停止已有服务
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3001 :5173"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 启动后端
echo 启动后端服务...
cd /d "%~dp0backend"
start "后端服务" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

:: 启动前端
echo 启动前端服务...
cd /d "%~dp0frontend"
start "前端服务" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo 服务已启动:
echo   后端: http://localhost:3001
echo   前端: http://localhost:5173
echo.
echo 测试账号:
echo   普通用户: user1/password1
echo   管理员: admin/admin123
echo.

start http://localhost:5173

echo 按任意键退出（服务将继续运行）
pause >nul
