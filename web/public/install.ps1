$repo = "Verifieddanny/BunGuard"
$binary = "burnguard"
$arch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "386" }

$latest = (Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/releases/latest" -UseBasicParsing | ConvertFrom-Json).tag_name
$url = "https://github.com/$repo/releases/download/$latest/${binary}_windows_${arch}.zip"

Write-Host "Downloading BurnGuard $latest..."
$tmp = New-TemporaryFile | Rename-Item -NewName { $_.Name + ".zip" } -PassThru
Invoke-WebRequest -Uri $url -OutFile $tmp.FullName

$dest = "$env:LOCALAPPDATA\BurnGuard"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Expand-Archive -Path $tmp.FullName -DestinationPath $dest -Force
Remove-Item $tmp.FullName

$path = [Environment]::GetEnvironmentVariable("Path", "User")
if ($path -notlike "*$dest*") {
    [Environment]::SetEnvironmentVariable("Path", "$path;$dest", "User")
}

Write-Host ""
Write-Host "BurnGuard $latest installed!" -ForegroundColor Green
Write-Host "Restart your terminal, then run:"
Write-Host "  burnguard init"
Write-Host "  burnguard start"