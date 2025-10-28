# Fix specific user test8@test.com
Write-Host "Fixing test8@test.com user..." -ForegroundColor Green

$baseUrl = "https://localhost:7000"

try {
    Write-Host "1. Testing API..." -ForegroundColor Yellow
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/test" -Method GET
    Write-Host "API working" -ForegroundColor Green

    Write-Host "2. Fixing test8@test.com password..." -ForegroundColor Yellow
    $fixData = @{
        email = "test8@test.com"
        password = "test"
    } | ConvertTo-Json

    $fixResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/fix-specific-user" -Method POST -Body $fixData -ContentType "application/json"
    Write-Host "User fixed: $($fixResponse.message)" -ForegroundColor Green

    Write-Host "3. Testing login..." -ForegroundColor Yellow
    $loginData = @{
        Email = "test8@test.com"
        Password = "test"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "User ID: $($loginResponse.userId)" -ForegroundColor Green

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

