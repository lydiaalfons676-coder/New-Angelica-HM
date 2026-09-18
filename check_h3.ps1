# Check the structure around related products closing divs
param([string]$File = "bag55.html")

$path = "c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)\$File"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Find product-page, product-details, and related sections
$ppIdx = $content.IndexOf('class="product-page"')
$pdIdx = $content.IndexOf('class="product-details"')
$relIdx = $content.IndexOf('Related Products</h3>')
$scriptIdx = $content.IndexOf('<script src="script.js')

Write-Host "File: $File"
Write-Host "  product-page at: $ppIdx"
Write-Host "  product-details at: $pdIdx"
Write-Host "  Related Products h3 at: $relIdx"
Write-Host "  script at: $scriptIdx"

# Count div tags between product-details and related h3
if ($pdIdx -ge 0 -and $relIdx -ge 0) {
    $section = $content.Substring($pdIdx, $relIdx - $pdIdx)
    $opens = ([regex]::Matches($section, '<div').Count)
    $closes = ([regex]::Matches($section, '</div>').Count)
    Write-Host "  Between product-details and related: opens=$opens closes=$closes"
}

# Count div tags between related-end and script
$endMarker = '</div>   <!--'
$endIdx = $content.IndexOf($endMarker, $relIdx)
if ($endIdx) { $endIdx = $endIdx + 200 } # approximate end of comment
else { $endIdx = $relIdx + 200 }
$endMarkerFull = $content.Substring($relIdx, 2000)
$endIdx = $endMarkerFull.IndexOf('<!-- نهاية related-products -->')
if ($endIdx -ge 0) {
    $endIdxReal = $relIdx + $endIdx + '<!-- نهاية related-products -->'.Length
    $after = $content.Substring($endIdxReal, $scriptIdx - $endIdxReal)
    $closesAfter = ([regex]::Matches($after, '</div>').Count)
    $opensAfter = ([regex]::Matches($after, '<div').Count)
    Write-Host "  After related-end, before script: opens=$opensAfter closes=$closesAfter"
}

# Show last 400 chars before Related Products
$showStart = [Math]::Max(0, $relIdx - 400)
$context = $content.Substring($showStart, $relIdx - $showStart)
Write-Host "=== Last 400 chars before Related Products ==="
Write-Host ($context -replace "`r`n", "`n")
