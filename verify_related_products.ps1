# Read-only verification of the Related Products section on every product page
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$bag1Text = [System.IO.File]::ReadAllText((Join-Path $root "bag1.html"))
$emoji = [regex]::Match($bag1Text, '<h3>(.+?)\s+Related Products</h3>').Groups[1].Value.Trim()
$endComment = [regex]::Match($bag1Text, '<!--\s*(.+?related-products.*?)\s*-->').Groups[1].Value
$h3Pattern = '<h3>' + [regex]::Escape($emoji) + '\s+Related Products</h3>'
$sectionPattern = $h3Pattern + '[\s\S]*?<!--\s*' + [regex]::Escape($endComment) + '\s*-->'

$bagNums = @(1..6) + @(8..36) + @(38..62)
$failures = 0

foreach ($n in $bagNums) {
    $html = [System.IO.File]::ReadAllText((Join-Path $root ("bag{0}.html" -f $n)))
    $count = [regex]::Matches($html, $h3Pattern).Count
    if ($count -ne 1) { Write-Output "FAIL bag$n.html : heading count = $count"; $failures++; continue }
    $section = [regex]::Match($html, $sectionPattern).Value
    $links = [regex]::Matches($section, 'href="([^"]+\.html)"')
    $imgs  = [regex]::Matches($section, '<img src="([^"]+)" alt="([^"]*)">')
    if ($links.Count -ne 2 -or $imgs.Count -ne 2) { Write-Output "FAIL bag$n.html : links=$($links.Count) imgs=$($imgs.Count)"; $failures++; continue }
    foreach ($l in $links) {
        $target = $l.Groups[1].Value
        if ($target -eq "bag$n.html") { Write-Output "FAIL bag$n.html : self-link"; $failures++ }
        if (-not (Test-Path (Join-Path $root $target))) { Write-Output "FAIL bag$n.html : missing $target"; $failures++ }
    }
    foreach ($i in $imgs) {
        $src = $i.Groups[1].Value
        if (-not (Test-Path (Join-Path $root $src))) { Write-Output "FAIL bag$n.html : missing image $src"; $failures++ }
    }
}

# product.html
$pHtml = [System.IO.File]::ReadAllText((Join-Path $root "product.html"))
$pCount = [regex]::Matches($pHtml, $h3Pattern).Count
if ($pCount -ne 1) { Write-Output "FAIL product.html : heading count = $pCount"; $failures++ }
else {
    $pSection = [regex]::Match($pHtml, $sectionPattern).Value
    $pLinks = [regex]::Matches($pSection, 'href="([^"]+\.html)"')
    $pImgs = [regex]::Matches($pSection, '<img src="([^"]+)" alt="([^"]*)">')
    if ($pLinks.Count -ne 2 -or $pImgs.Count -ne 2) { Write-Output "FAIL product.html : links=$($pLinks.Count) imgs=$($pImgs.Count)"; $failures++ }
    foreach ($l in $pLinks) { if (-not (Test-Path (Join-Path $root $l.Groups[1].Value))) { Write-Output "FAIL product.html : missing $($l.Groups[1].Value)"; $failures++ } }
    foreach ($i in $pImgs) { if (-not (Test-Path (Join-Path $root $i.Groups[1].Value))) { Write-Output "FAIL product.html : missing image $($i.Groups[1].Value)"; $failures++ } }
}

if ($failures -eq 0) { Write-Output "ALL CHECKS PASSED - 60 bag pages + product.html" }
else { Write-Output "TOTAL FAILURES: $failures" }