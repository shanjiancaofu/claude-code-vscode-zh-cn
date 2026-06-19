@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0patch.ps1" %*
exit /b %ERRORLEVEL%
