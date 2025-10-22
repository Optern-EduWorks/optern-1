# Quick fix for authentication issue
Write-Host "🔧 Fixing authentication for test8@test.com..." -ForegroundColor Green

$baseUrl = "https://localhost:7000"

try {
    # Wait a moment for API to start
    Start-Sleep -Seconds 3
    
    Write-Host "1. Testing API connection..." -ForegroundColor Yellow
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/test" -Method GET -SkipCertificateCheck
    Write-Host "✅ API is working" -ForegroundColor Green

    Write-Host "2. Checking user test8@test.com..." -ForegroundColor Yellow
    $debugResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/debug-users" -Method GET -SkipCertificateCheck
    
    $testUser = $debugResponse.users | Where-Object { $_.email -eq "test8@test.com" }
    if ($testUser) {
        Write-Host "Found user: $($testUser.email)" -ForegroundColor Green
        Write-Host "Password status: $(if ($testUser.isHashed) { 'HASHED' } else { 'PLAIN TEXT' })" -ForegroundColor $(if ($testUser.isHashed) { "Green" } else { "Red" })
    } else {
        Write-Host "❌ User test8@test.com not found" -ForegroundColor Red
    }

    Write-Host "3. Fixing all plain text passwords..." -ForegroundColor Yellow
    $fixResponse = Invoke-RestMethod -Uri "$baseUrl/api/Users/fix-passwords" -Method POST -SkipCertificateCheck
    Write-Host "✅ Fixed $($fixResponse.fixedCount) passwords" -ForegroundColor Green

    Write-Host "4. Testing login for test8@test.com..." -ForegroundColor Yellow
    $loginData = @{
        Email = "test8@test.com"
        Password = "test"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $loginData -ContentType "application/json" -SkipCertificateCheck
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User ID: $($loginResponse.userId)" -ForegroundColor Green
    Write-Host "Role: $($loginResponse.role)" -ForegroundColor Green

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
