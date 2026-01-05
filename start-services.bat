@echo off
title 启动企业内部福利商城服务

echo 正在启动企业内部福利商城前后端服务...
echo.

:: 检查并停止可能占用端口的进程
echo 检查端口占用情况...
netstat -ano | findstr :3001 > nul
if %ERRORLEVEL% EQU 0 (
    echo 端口3001被占用，正在结束相关进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /F /PID %%a > nul 2>&1
    )
)

netstat -ano | findstr :5173 > nul
if %ERRORLEVEL% EQU 0 (
    echo 端口5173被占用，正在结束相关进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        taskkill /F /PID %%a > nul 2>&1
    )
)

:: 启动后端服务
echo 正在启动后端服务...
cd /d "%~dp0backend"
start "企业商城后端服务" cmd /k "npm run dev"

:: 等待后端服务启动
echo 等待后端服务启动...
timeout /t 5 /nobreak > nul

:: 启动前端服务
echo 正在启动前端服务...
cd /d "%~dp0frontend"
start "企业商城前端服务" cmd /k "npm run dev"

echo.
echo 服务启动完成！
echo 后端服务地址: http://localhost:3001
echo 前端服务地址: http://localhost:5173
echo.
echo 按任意键打开前端页面...
pause > nul

:: 打开浏览器
start http://localhost:5173

echo.
echo 提示: 关闭此窗口不会停止服务，如需停止服务请关闭对应的命令窗口
pause