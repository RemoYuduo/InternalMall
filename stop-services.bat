@echo off
title 停止企业内部福利商城服务

echo 正在停止企业内部福利商城前后端服务...
echo.

:: 停止端口3001的进程
echo 正在停止后端服务 (端口3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo 正在结束进程 PID: %%a
    taskkill /F /PID %%a > nul 2>&1
)

:: 停止端口5173的进程
echo 正在停止前端服务 (端口5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo 正在结束进程 PID: %%a
    taskkill /F /PID %%a > nul 2>&1
)

echo.
echo 所有服务已停止
echo.
pause