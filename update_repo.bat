@echo off
echo Checking for changes in the repository...

git status --porcelain > nul
if %errorlevel% neq 0 (
    echo Error: Not a git repository or git not installed.
    pause
    exit /b 1
)

git status --porcelain | findstr . > nul
if %errorlevel% neq 0 (
    echo No changes to commit. Repository is up to date.
    pause
    exit /b 0
)

echo Changes detected. Adding files...
git add .

echo Committing changes...
git commit -m "Automatic update"

if %errorlevel% neq 0 (
    echo Error: Failed to commit changes.
    pause
    exit /b 1
)

echo Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo Error: Failed to push to GitHub. Check your remote configuration.
    pause
    exit /b 1
)

echo Repository updated successfully!
pause
