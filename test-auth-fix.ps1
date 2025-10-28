# Test Authentication Fix
Write-Host "=== TESTING AUTHENTICATION FIX ===" -ForegroundColor Green

# Test the API endpoints that should be working
$baseUrl = "https://localhost:7154"

Write-Host "`n1. Testing API endpoints..." -ForegroundColor Cyan

try {
    # Test basic connectivity
    Write-Host "Testing basic connectivity..." -ForegroundColor Yellow
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/test" -Method GET
    Write-Host "✅ API is working: $($testResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ API connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the API is running with: cd JobPortalAPI && dotnet run" -ForegroundColor Yellow
    exit 1
}

try {
    # Test user debug endpoint
    Write-Host "`n2. Checking user authentication status..." -ForegroundColor Cyan
    $debugResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/debug-users" -Method GET
    Write-Host "Found $($debugResponse.userCount) users in database" -ForegroundColor Green
    
    $hashedCount = 0
    $plainTextCount = 0
    
    foreach ($user in $debugResponse.users) {
        $status = if ($user.isHashed) { "HASHED ✅"; $hashedCount++ } else { "PLAIN TEXT ❌"; $plainTextCount++ }
        $color = if ($user.isHashed) { "Green" } else { "Red" }
        Write-Host "  - $($user.email) ($($user.role)): $status" -ForegroundColor $color
    }
    
    Write-Host "`nSummary:" -ForegroundColor Cyan
    Write-Host "  - Hashed passwords: $hashedCount" -ForegroundColor Green
    Write-Host "  - Plain text passwords: $plainTextCount" -ForegroundColor Red
    
    if ($plainTextCount -gt 0) {
        Write-Host "`n3. Fixing plain text passwords..." -ForegroundColor Cyan
        $fixResponse = Invoke-RestMethod -Uri "$baseUrl/api/Users/fix-passwords" -Method POST
        Write-Host "✅ Fixed $($fixResponse.fixedCount) passwords" -ForegroundColor Green
    } else {
        Write-Host "`n✅ All passwords are already properly hashed!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error checking users: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== AUTHENTICATION TEST COMPLETED ===" -ForegroundColor Green
Write-Host "The authentication system should now be working properly!" -ForegroundColor Green
