$path = "c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)\admin.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "saved without BOM"
