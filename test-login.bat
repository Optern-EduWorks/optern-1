@echo off
echo Testing login for test8@test.com...

echo.
echo 1. Testing API connection...
curl -k -s https://localhost:7000/api/Auth/test

echo.
echo 2. Fixing user password...
curl -k -s -X POST https://localhost:7000/api/Auth/fix-specific-user -H "Content-Type: application/json" -d "{\"email\":\"test8@test.com\",\"password\":\"test\"}"

echo.
echo 3. Testing login...
curl -k -s -X POST https://localhost:7000/api/Auth/login -H "Content-Type: application/json" -d "{\"Email\":\"test8@test.com\",\"Password\":\"test\"}"

echo.
echo Done!
pause

