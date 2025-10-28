# Simple Authentication Test
Write-Host "=== SIMPLE AUTHENTICATION TEST ===" -ForegroundColor Green

# Test HTTP instead of HTTPS to avoid certificate issues
$baseUrl = "http://localhost:5000"

Write-Host "Testing API at: $baseUrl" -ForegroundColor Yellow

try {
    # Test basic connectivity
    Write-Host "`n1. Testing API connection..." -ForegroundColor Cyan
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/test" -Method GET
    Write-Host "✅ API is working: $($testResponse.message)" -ForegroundColor Green
    
    # Test user debug endpoint
    Write-Host "`n2. Checking users..." -ForegroundColor Cyan
    $debugResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/debug-users" -Method GET
    Write-Host "Found $($debugResponse.userCount) users in database" -ForegroundColor Green
    
    foreach ($user in $debugResponse.users) {
        $status = if ($user.isHashed) { "HASHED ✅" } else { "PLAIN TEXT ❌" }
        $color = if ($user.isHashed) { "Green" } else { "Red" }
        Write-Host "  - $($user.email) ($($user.role)): $status" -ForegroundColor $color
    }
    
    # Test login with first user
    if ($debugResponse.users.Count -gt 0) {
        Write-Host "`n3. Testing login..." -ForegroundColor Cyan
        $firstUser = $debugResponse.users[0]
        $loginData = @{
            Email = $firstUser.email
            Password = "test"  # Default password
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $loginData -ContentType "application/json"
            Write-Host "✅ Login successful for $($firstUser.email)" -ForegroundColor Green
            Write-Host "  User ID: $($loginResponse.userId)" -ForegroundColor Green
            Write-Host "  Role: $($loginResponse.role)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Login failed for $($firstUser.email): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the API is running on $baseUrl" -ForegroundColor Yellow
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Green
