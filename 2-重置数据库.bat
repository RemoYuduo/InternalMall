@echo off
chcp 65001 >nul
title 重置数据库

echo [重置数据库]
echo.

cd /d "%~dp0backend"

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装
    pause
    exit /b 1
)

echo 正在重置...
node init-db.js

if %errorlevel% equ 0 (
    echo.
    echo 数据库重置成功！
) else (
    echo.
    echo 数据库重置失败！
)

pause
