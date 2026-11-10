# Regenerates videos.json from the files in the videos folder.
$dir = Join-Path $PSScriptRoot "videos"
$names = Get-ChildItem $dir -File | Where-Object { $_.Extension -match '^\.(mp4|webm|mov|m4v)$' } | Sort-Object Name | ForEach-Object { $_.Name }
ConvertTo-Json @($names) | Set-Content (Join-Path $PSScriptRoot "videos.json") -Encoding utf8
Write-Host "Wrote $(@($names).Count) videos to videos.json"
