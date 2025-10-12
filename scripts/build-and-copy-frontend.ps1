Param(
    [string]$FrontendPath = "./frontend",
    [string]$BackendWwwroot = "./JobPortalAPI/wwwroot"
)

Write-Host "Building frontend in $FrontendPath..."
Push-Location $FrontendPath
npm install
npm run build --if-present
$distPath = Join-Path -Path (Get-Location) -ChildPath "dist"
if (!(Test-Path $distPath)) {
    Write-Error "Build failed or dist folder not found: $distPath"
    Exit 1
}

# find the project output (assume single project folder inside dist)
$distProject = Get-ChildItem -Path $distPath -Directory | Select-Object -First 1
if ($null -eq $distProject) {
    Write-Error "No project folder found inside dist"
    Exit 1
}
$source = $distProject.FullName
Pop-Location

Write-Host "Copying built files from $source to $BackendWwwroot ..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $BackendWwwroot
New-Item -ItemType Directory -Path $BackendWwwroot -Force | Out-Null
Copy-Item -Recurse -Force -Path (Join-Path $source "*") -Destination $BackendWwwroot
Write-Host "Frontend build copied to $BackendWwwroot"
