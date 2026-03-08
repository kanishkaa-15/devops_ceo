@echo off
echo Starting School CEO Dashboard with MongoDB via Docker...
echo.

echo Starting MongoDB via Docker...
docker-compose up -d mongodb

echo Waiting for MongoDB to start...
timeout /t 5 /nobreak > nul
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo MongoDB: mongodb://localhost:27017/school_ceo_dashboard
echo.
echo Default Login Credentials:
echo Admin: admin@school.edu / admin123
echo CEO: ceo@school.edu / ceo123
echo Staff: staff@school.edu / staff123
echo Parent: parent@school.edu / parent123
echo.
pause