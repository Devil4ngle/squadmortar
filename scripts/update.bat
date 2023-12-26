@echo off
timeout /t 3 /nobreak > nul
cd ..
echo Fetching from Git...
"%CD%\scripts\git\bin\git.exe" fetch -v --force
echo Script is up to date. Press any key to close and start the script.
pause