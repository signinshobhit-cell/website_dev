@echo off
cd /d "%~dp0"
set "NEWS_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "NEWS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%NEWS_NODE%" scripts\open-newsroom.cjs
pause
