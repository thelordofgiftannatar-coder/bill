@echo off
REM Recreates the hidden items (.github\workflows and .gitignore) from the visible copies.
REM Run this once inside the project folder BEFORE git add / upload.
mkdir ".github\workflows" 2>nul
copy /Y "WORKFLOW-build-windows.yml" ".github\workflows\build-windows.yml" >nul
copy /Y "gitignore-copy.txt" ".gitignore" >nul
echo Done. Hidden files restored.
pause
