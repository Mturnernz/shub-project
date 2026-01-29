@echo off
REM Development environment management scripts for Windows

if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="clean" goto clean
if "%1"=="build" goto build
if "%1"=="status" goto status
goto help

:start
echo Starting Shub development environment...
docker-compose up -d
echo.
echo Services started! Access the app at:
echo Frontend: http://localhost:5173
echo Supabase: http://localhost:54321
goto end

:stop
echo Stopping Shub development environment...
docker-compose down
goto end

:restart
echo Restarting Shub development environment...
docker-compose restart
goto end

:logs
echo Showing application logs (Ctrl+C to exit)...
docker-compose logs -f shub-app
goto end

:clean
echo Cleaning up Docker environment (this will remove all data)...
set /p choice="Are you sure? (y/N): "
if /i "%choice%"=="y" (
    docker-compose down -v
    docker system prune -f
    echo Environment cleaned!
) else (
    echo Operation cancelled.
)
goto end

:build
echo Rebuilding Docker images...
docker-compose build --no-cache
goto end

:status
echo Docker environment status:
docker-compose ps
goto end

:help
echo Shub Development Environment Manager
echo.
echo Usage: dev-scripts.bat [command]
echo.
echo Commands:
echo   start    Start the development environment
echo   stop     Stop the development environment
echo   restart  Restart all services
echo   logs     Show application logs
echo   build    Rebuild Docker images
echo   status   Show container status
echo   clean    Clean up Docker environment (removes data)
echo.
echo Examples:
echo   dev-scripts.bat start
echo   dev-scripts.bat logs
echo   dev-scripts.bat stop

:end