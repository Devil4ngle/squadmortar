@echo off
setlocal

cd frontend
call npm run buildOnce 
cd ..
if exist gh-pages rmdir /s /q gh-pages

mkdir gh-pages

git clone --branch gh-pages --single-branch https://github.com/Devil4ngle/squadmortar gh-pages

cd gh-pages

for /F "delims=" %%i in ('dir /b') do (if not "%%i"=="\.git" rmdir /s /q "%%i" 2>nul & del /f /q "%%i" 2>nul)

cd .. 

xcopy /s /e frontend\public gh-pages\

cd gh-pages

git add .

git commit -m "Update gh-pages"

git push origin gh-pages

echo Task completed successfully.

pause