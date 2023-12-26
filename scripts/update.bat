@echo off
timeout /t 3 /nobreak 
echo Fetching from Git...
"%CD%\scripts\git\bin\git.exe" update-index --skip-worktree scripts/git/*
"%CD%\scripts\git\bin\git.exe" fetch origin
"%CD%\scripts\git\bin\git.exe" reset origin/release
echo Script is up to date. Press any key to close.
pause
