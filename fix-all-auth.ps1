# Comprehensive fix for ALL authentication issues
Write-Host "=== COMPREHENSIVE AUTHENTICATION FIX ===" -ForegroundColor Green
Write-Host "This will fix authentication for ALL users" -ForegroundColor Yellow

$baseUrl = "https://localhost:7154"

# Wait for API to start
Write-Host "Waiting for API to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

try {
    # Step 1: Test API connection
    Write-Host "`n1. Testing API connection..." -ForegroundColor Cyan
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/test" -Method GET
    Write-Host "✅ API is working: $($testResponse.message)" -ForegroundColor Green

    # Step 2: Check current users
    Write-Host "`n2. Checking all users..." -ForegroundColor Cyan
    $debugResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/debug-users" -Method GET
    Write-Host "Found $($debugResponse.userCount) users in database" -ForegroundColor Green
    
    foreach ($user in $debugResponse.users) {
        $status = if ($user.isHashed) { "HASHED ✅" } else { "PLAIN TEXT ❌" }
        $color = if ($user.isHashed) { "Green" } else { "Red" }
        Write-Host "  - $($user.email) ($($user.role)): $status" -ForegroundColor $color
    }

    # Step 3: Fix ALL plain text passwords
    Write-Host "`n3. Fixing ALL plain text passwords..." -ForegroundColor Cyan
    $fixResponse = Invoke-RestMethod -Uri "$baseUrl/api/Users/fix-passwords" -Method POST
    Write-Host "✅ Fixed $($fixResponse.fixedCount) passwords" -ForegroundColor Green

    # Step 4: Verify the fix
    Write-Host "`n4. Verifying fix..." -ForegroundColor Cyan
    $debugResponse2 = Invoke-RestMethod -Uri "$baseUrl/api/Auth/debug-users" -Method GET
    
    $allHashed = $true
    foreach ($user in $debugResponse2.users) {
        $status = if ($user.isHashed) { "HASHED ✅" } else { "PLAIN TEXT ❌" }
        $color = if ($user.isHashed) { "Green" } else { "Red" }
        Write-Host "  - $($user.email) ($($user.role)): $status" -ForegroundColor $color
        
        if (-not $user.isHashed) {
            $allHashed = $false
        }
    }

    if ($allHashed) {
        Write-Host "`n🎉 ALL PASSWORDS ARE NOW PROPERLY HASHED!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Some passwords still need fixing" -ForegroundColor Yellow
    }

    # Step 5: Test login with a few users
    Write-Host "`n5. Testing login with sample users..." -ForegroundColor Cyan
    
    # Test with first few users
    $testUsers = $debugResponse2.users | Select-Object -First 3
    foreach ($user in $testUsers) {
        try {
            $loginData = @{
                Email = $user.email
                Password = "test"  # Assuming default password
            } | ConvertTo-Json

            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $loginData -ContentType "application/json"
            Write-Host "✅ Login successful for $($user.email)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Login failed for $($user.email): $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host "`n=== AUTHENTICATION FIX COMPLETED ===" -ForegroundColor Green
    Write-Host "All users should now be able to log in!" -ForegroundColor Green

} catch {
    Write-Host "`n❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the API is running on $baseUrl" -ForegroundColor Yellow
}
