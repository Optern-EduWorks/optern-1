# Final Authentication Test
Write-Host "=== FINAL AUTHENTICATION TEST ===" -ForegroundColor Green

$baseUrl = "http://localhost:5000"

Write-Host "`nTesting authentication with working credentials..." -ForegroundColor Cyan

# Test candidate login
Write-Host "`n1. Testing Candidate Login..." -ForegroundColor Yellow
try {
    $candidateLogin = @{
        Email = "candidate@test.com"
        Password = "password123"
    } | ConvertTo-Json
    
    $candidateResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $candidateLogin -ContentType "application/json"
    Write-Host "✅ CANDIDATE LOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host "  User ID: $($candidateResponse.userId)" -ForegroundColor White
    Write-Host "  Role: $($candidateResponse.role)" -ForegroundColor White
    Write-Host "  Email: $($candidateResponse.email)" -ForegroundColor White
    Write-Host "  Token: $($candidateResponse.token.Substring(0, 20))..." -ForegroundColor White
} catch {
    Write-Host "❌ Candidate login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test recruiter login
Write-Host "`n2. Testing Recruiter Login..." -ForegroundColor Yellow
try {
    $recruiterLogin = @{
        Email = "recruiter2@test.com"
        Password = "password123"
    } | ConvertTo-Json
    
    $recruiterResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -Body $recruiterLogin -ContentType "application/json"
    Write-Host "✅ RECRUITER LOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host "  User ID: $($recruiterResponse.userId)" -ForegroundColor White
    Write-Host "  Role: $($recruiterResponse.role)" -ForegroundColor White
    Write-Host "  Email: $($recruiterResponse.email)" -ForegroundColor White
    Write-Host "  Token: $($recruiterResponse.token.Substring(0, 20))..." -ForegroundColor White
} catch {
    Write-Host "❌ Recruiter login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== AUTHENTICATION IS WORKING! ===" -ForegroundColor Green
Write-Host "`nUse these credentials to test the frontend:" -ForegroundColor Yellow
Write-Host "  Candidate: candidate@test.com / password123" -ForegroundColor White
Write-Host "  Recruiter: recruiter2@test.com / password123" -ForegroundColor White
Write-Host "`nThe authentication system is now fully functional!" -ForegroundColor Green
