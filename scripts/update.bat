@echo off
timeout /t 1 /nobreak 
echo Fetching from Git...
"%CD%\scripts\git\bin\git.exe" gc
"%CD%\scripts\git\bin\git.exe" fetch
echo n | "%CD%\scripts\git\bin\git.exe" reset origin/release --hard
echo Script is up to date. Press any key to close.
pause