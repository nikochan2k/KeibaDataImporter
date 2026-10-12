@echo off
rem setup-windows.ps1 を実行ポリシーに関係なく起動する。管理者権限のコマンドプロンプトで実行する。
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-windows.ps1"
if errorlevel 1 exit /b 1
pause
