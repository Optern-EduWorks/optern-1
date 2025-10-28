# Complete Authentication Fix
Write-Host "=== COMPLETE AUTHENTICATION FIX ===" -ForegroundColor Green

$baseUrl = "http://localhost:5000"

# First, let's test if we can create a user directly
Write-Host "`n1. Creating test users with proper data..." -ForegroundColor Cyan

# Create a recruiter user
$recruiterData = @{
    Email = "recruiter@test.com"
    Password = "password123"
    Username = "Test Recruiter"
    Role = "recruiter"
    Status = "Active"
    VerificationStatus = "Verified"
} | ConvertTo-Json

Write-Host "Creating recruiter user..." -ForegroundColor Yellow
try {
    $recruiterResponse = Invoke-RestMethod -Uri "$baseUrl/api/Users" -Method POST -Body $recruiterData -ContentType "application/json"
    Write-Host "✅ Recruiter user created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create recruiter: $($_.Exception.Message)" -ForegroundColor Red
}

# Create a candidate user
$candidateData = @{
    Email = "candidate@test.com"
    Password = "password123"
    Username = "Test Candidate"
    Role = "student"
    Status = "Active"
    VerificationStatus = "Verified"
} | ConvertTo-Json

Write-Host "Creating candidate user..." -ForegroundColor Yellow
try {
    $candidateResponse = Invoke-RestMethod -Uri "$baseUrl/api/Users" -Method POST -Body $candidateData -ContentType "application/json"
    Write-Host "✅ Candidate user created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create candidate: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing login with created users..." -ForegroundColor Cyan

# Test recruiter login
Write-Host "Testing recruiter login..." -ForegroundColor Yellow
try {
    $recruiterLogin = @{
        Email = "recruiter@test.com"
        Password = "password123"
    } | ConvertTo-Json
    
    $recruiterLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $recruiterLogin -ContentType "application/json"
    Write-Host "✅ Recruiter login successful!" -ForegroundColor Green
    Write-Host "  User ID: $($recruiterLoginResponse.userId)" -ForegroundColor White
    Write-Host "  Role: $($recruiterLoginResponse.role)" -ForegroundColor White
    Write-Host "  Email: $($recruiterLoginResponse.email)" -ForegroundColor White
} catch {
    Write-Host "❌ Recruiter login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Error details: $($_.Exception.Response)" -ForegroundColor Red
}

# Test candidate login
Write-Host "`nTesting candidate login..." -ForegroundColor Yellow
try {
    $candidateLogin = @{
        Email = "candidate@test.com"
        Password = "password123"
    } | ConvertTo-Json
    
    $candidateLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $candidateLogin -ContentType "application/json"
    Write-Host "✅ Candidate login successful!" -ForegroundColor Green
    Write-Host "  User ID: $($candidateLoginResponse.userId)" -ForegroundColor White
    Write-Host "  Role: $($candidateLoginResponse.role)" -ForegroundColor White
    Write-Host "  Email: $($candidateLoginResponse.email)" -ForegroundColor White
} catch {
    Write-Host "❌ Candidate login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Error details: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== AUTHENTICATION FIX COMPLETED ===" -ForegroundColor Green
Write-Host "Test credentials:" -ForegroundColor Yellow
Write-Host "  Recruiter: recruiter@test.com / password123" -ForegroundColor White
Write-Host "  Candidate: candidate@test.com / password123" -ForegroundColor White
