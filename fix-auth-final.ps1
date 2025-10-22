# Final fix for authentication issue
Write-Host "Fixing authentication for test8@test.com..." -ForegroundColor Green

$baseUrl = "https://localhost:7000"

try {
    Start-Sleep -Seconds 3
    
    Write-Host "1. Testing API connection..." -ForegroundColor Yellow
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/test" -Method GET
    Write-Host "API is working" -ForegroundColor Green

    Write-Host "2. Fixing all plain text passwords..." -ForegroundColor Yellow
    $fixResponse = Invoke-RestMethod -Uri "$baseUrl/api/Users/fix-passwords" -Method POST
    Write-Host "Fixed $($fixResponse.fixedCount) passwords" -ForegroundColor Green

    Write-Host "3. Testing login for test8@test.com..." -ForegroundColor Yellow
    $loginData = @{
        Email = "test8@test.com"
        Password = "test"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "User ID: $($loginResponse.userId)" -ForegroundColor Green
    Write-Host "Role: $($loginResponse.role)" -ForegroundColor Green

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

