# Inspect the structure of a file around the related products section
param([string]$File = "bag3.html")

$path = "c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)\$File"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Find "Related Products" and show context around it
$idx = $content.IndexOf("Related Products</h3>")
if ($idx -lt 0) {
    Write-Host "NOT FOUND: $File"
    exit
}

# Show 800 chars before and 800 after
$start = $idx - 800
if ($start -lt 0) { $start = 0 }
$end = $idx + 800
if ($end -gt $content.Length) { $end = $content.Length }

$context = $content.Substring($start, $end - $start)
Write-Host "=== Context around Related Products in $File ==="
Write-Host $context