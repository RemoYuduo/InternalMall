@echo off
title 初始化数据库
echo 正在初始化数据库...

cd /d "%~dp0backend"

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 运行数据库初始化脚本
node init-db.js

if %errorlevel% equ 0 (
    echo 数据库初始化成功！
) else (
    echo 数据库初始化失败！
)

pause