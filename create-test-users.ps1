# Create Test Users for Authentication
Write-Host "=== CREATING TEST USERS ===" -ForegroundColor Green

$baseUrl = "http://localhost:5000"

# Test users to create
$testUsers = @(
    @{
        Email = "recruiter@test.com"
        Password = "password123"
        Username = "Test Recruiter"
        Role = "recruiter"
        Status = "Active"
        VerificationStatus = "Verified"
    },
    @{
        Email = "candidate@test.com"
        Password = "password123"
        Username = "Test Candidate"
        Role = "student"
        Status = "Active"
        VerificationStatus = "Verified"
    }
)

Write-Host "Creating test users..." -ForegroundColor Yellow

foreach ($user in $testUsers) {
    try {
        $userJson = $user | ConvertTo-Json
        Write-Host "Creating user: $($user.Email)" -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/Users" -Method POST -Body $userJson -ContentType "application/json"
        Write-Host "✅ User created: $($user.Email)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create $($user.Email): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTesting login with created users..." -ForegroundColor Yellow

foreach ($user in $testUsers) {
    try {
        $loginData = @{
            Email = $user.Email
            Password = $user.Password
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "✅ Login successful for $($user.Email) - Role: $($loginResponse.role)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Login failed for $($user.Email): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== TEST USERS CREATED ===" -ForegroundColor Green
Write-Host "You can now test authentication with:" -ForegroundColor Yellow
Write-Host "  Recruiter: recruiter@test.com / password123" -ForegroundColor White
Write-Host "  Candidate: candidate@test.com / password123" -ForegroundColor White
