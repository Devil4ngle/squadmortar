@echo off
timeout /t 3 /nobreak > nul
/scripts/git.exe fetch https://github.com/Devil4ngle/squadmortar.git release --quiet
