# Quick fix for test8@test.com
Write-Host "Quick fix for test8@test.com" -ForegroundColor Green

# Test API
try {
    $response = Invoke-WebRequest -Uri "https://localhost:7000/api/Auth/test" -UseBasicParsing
    Write-Host "API Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Fix user
try {
    $body = '{"email":"test8@test.com","password":"test"}'
    $response = Invoke-WebRequest -Uri "https://localhost:7000/api/Auth/fix-specific-user" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Fix Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Fix Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test login
try {
    $body = '{"Email":"test8@test.com","Password":"test"}'
    $response = Invoke-WebRequest -Uri "https://localhost:7000/api/Auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Login Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Login Error: $($_.Exception.Message)" -ForegroundColor Red
}

