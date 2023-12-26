@echo off
timeout /t 3 /nobreak > nul
cd ..
"%CD%\scripts\git\bin\git.exe" fetch
