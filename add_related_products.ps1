# Adds a "Related Products" section (identical design to bag1.html) to every
# product details page: bag1..bag62 + product.html
# - Pages that already have the section (bag1..bag4) get it replaced with the
#   standard version (fixes self-links in bag2/bag3).
# - All other pages get the section inserted right before the page script tag,
#   which is the same DOM position used by bag1.html.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# ---- 1. Load reference strings from bag1.html (emoji + Arabic end comment) ----
$bag1Text = [System.IO.File]::ReadAllText((Join-Path $root "bag1.html"))
$emoji = [regex]::Match($bag1Text, '<h3>(.+?)\s+Related Products</h3>').Groups[1].Value.Trim()
$endComment = [regex]::Match($bag1Text, '<!--\s*(.+?related-products.*?)\s*-->').Groups[1].Value
if (-not $emoji -or -not $endComment) { throw "Could not extract reference strings from bag1.html" }
Write-Output ("Reference emoji found; end comment: " + $endComment)

# ---- 2. Parse bagPageNames from script.js (same formula script.js uses) ----
$js = [System.IO.File]::ReadAllText((Join-Path $root "script.js"))
$arrMatch = [regex]::Match($js, 'const liveBagNames = \[(.*?)\];', 'Singleline')
if (-not $arrMatch.Success) { throw "liveBagNames not found in script.js" }
$names = [regex]::Matches($arrMatch.Groups[1].Value, '"([^"\\]*(?:\\.[^"\\]*)*)"') |
         ForEach-Object { $_.Groups[1].Value.Replace('\"', '"') }
Write-Output ("liveBagNames entries: " + $names.Count)

$bagPageNames = @{}
for ($i = 0; $i -lt $names.Count; $i++) {
    if ($i -lt 6)      { $bagNum = $i + 1 }
    elseif ($i -lt 35) { $bagNum = $i + 2 }
    else               { $bagNum = $i + 3 }
    $bagPageNames[$bagNum] = $names[$i]
}
$assign = [regex]::Match($js, 'Object\.assign\(bagPageNames,\s*\{(.*?)\}\s*\);', 'Singleline')
foreach ($m in [regex]::Matches($assign.Groups[1].Value, '(\d+)\s*:\s*"([^"]*)"')) {
    $bagPageNames[[int]$m.Groups[1].Value] = $m.Groups[2].Value
}
Write-Output ("bagPageNames entries: " + $bagPageNames.Count)

# ---- 3. Catalog order (every existing product page) ----
$bagNums = @(1..6) + @(8..36) + @(38..62)
Write-Output ("Catalog pages: " + $bagNums.Count)

# ---- 4. Static titles (fallback label for pages without a JS mapping) ----
$staticTitle = @{}
foreach ($n in $bagNums) {
    $html = [System.IO.File]::ReadAllText((Join-Path $root ("bag{0}.html" -f $n)))
    $t = [regex]::Match($html, '<title>(.*?)\s*\|\s*Angelica Handmade</title>')
    if (-not $t.Success) { throw "No title found in bag$n.html" }
    $staticTitle[$n] = $t.Groups[1].Value.Trim()
}

function Get-Label([int]$target) {
    if ($script:bagPageNames.ContainsKey($target)) { return $script:bagPageNames[$target] }
    return $script:staticTitle[$target]
}

function Get-RelatedNumbers([int]$pageBag) {
    $nums = $script:bagNums
    $idx = [array]::IndexOf($nums, $pageBag)
    if ($idx -lt 0) { throw "bag$pageBag not in catalog" }
    return @($nums[($idx + 1) % $nums.Count], $nums[($idx + 2) % $nums.Count])
}

function New-CardHtml([int]$target) {
    $label = Get-Label $target
    $img = "bag.jpg"; if ($target -ne 1) { $img = "bag$target.jpg" }
    $NL = "`r`n"
    $card  = "    <div class=`"related-card`">$NL$NL"
    $card += "<a href=`"bag$target.html`">$NL$NL"
    $card += "<img src=`"$img`" alt=`"$label`">$NL$NL"
    $card += "<p>$label</p>$NL$NL"
    $card += "</a>$NL$NL"
    $card += "</div>$NL$NL"
    return $card
}

function New-RelatedSection([int]$pageBag) {
    $NL = "`r`n"
    $section  = "<h3>$($script:emoji) Related Products</h3>$NL$NL"
    $section += "<div class=`"related-products`">$NL$NL"
    foreach ($r in (Get-RelatedNumbers $pageBag)) { $section += New-CardHtml $r }
    $section += "</div>   <!-- $($script:endComment) -->"
    return $section
}

function Save-Page([string]$path, [string]$content, [bool]$bom) {
    $enc = New-Object System.Text.UTF8Encoding($bom)
    [System.IO.File]::WriteAllText($path, $content, $enc)
}

$scriptTag = '<script src="script.js?v=6"></script>'
$updated = 0

foreach ($n in $bagNums) {
    $path = Join-Path $root ("bag{0}.html" -f $n)
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
    $html = [System.IO.File]::ReadAllText($path)

    $newSection = New-RelatedSection $n
    $h3Pattern = '<h3>' + [regex]::Escape($emoji) + '\s+Related Products</h3>'
    $endPattern = '<!--\s*' + [regex]::Escape($endComment) + '\s*-->'

    if ([regex]::IsMatch($html, $h3Pattern)) {
        $combined = $h3Pattern + '[\s\S]*?' + $endPattern
        if (-not [regex]::IsMatch($html, $combined)) { throw "Existing section not fully matched in bag$n.html" }
        $html = [regex]::Replace($html, $combined, $newSection.Replace('$', '$$'))
        $action = "replaced"
    }
    else {
        $tagIdx = $html.IndexOf($scriptTag)
        if ($tagIdx -lt 0) { throw "script tag not found in bag$n.html" }
        $block = "<hr>`r`n`r`n" + $newSection + "`r`n`r`n"
        $html = $html.Substring(0, $tagIdx) + $block + $html.Substring($tagIdx)
        $action = "added"
    }

    Save-Page $path $html $hasBom
    $updated++
    $rel = Get-RelatedNumbers $n
    Write-Output ("bag{0}.html {1}: bag{2} ({3}) + bag{4} ({5})" -f $n, $action, $rel[0], (Get-Label $rel[0]), $rel[1], (Get-Label $rel[1]))
}

# ---- 5. product.html (dynamic product template) gets the same section ----
$pPath = Join-Path $root "product.html"
$pBytes = [System.IO.File]::ReadAllBytes($pPath)
$pHasBom = ($pBytes.Length -ge 3 -and $pBytes[0] -eq 0xEF -and $pBytes[1] -eq 0xBB -and $pBytes[2] -eq 0xBF)
$pHtml = [System.IO.File]::ReadAllText($pPath)
$h3Pattern = '<h3>' + [regex]::Escape($emoji) + '\s+Related Products</h3>'
if (-not [regex]::IsMatch($pHtml, $h3Pattern)) {
    $sec  = "<h3>$emoji Related Products</h3>`r`n`r`n"
    $sec += "<div class=`"related-products`">`r`n`r`n"
    foreach ($r in @(1, 2)) { $sec += New-CardHtml $r }
    $sec += "</div>   <!-- $endComment -->"
    $tagIdx = $pHtml.IndexOf($scriptTag)
    if ($tagIdx -lt 0) { throw "script tag not found in product.html" }
    $pHtml = $pHtml.Substring(0, $tagIdx) + "<hr>`r`n`r`n" + $sec + "`r`n`r`n" + $pHtml.Substring($tagIdx)
    Save-Page $pPath $pHtml $pHasBom
    Write-Output "product.html added: bag1 (Havan Cordon Bag) + bag2 (Golden Pearl Bag)"
} else {
    Write-Output "product.html already has related products"
}

# ---- 6. Verification pass over every page ----
Write-Output "----- verification -----"
$failures = 0
foreach ($n in $bagNums) {
    $html = [System.IO.File]::ReadAllText((Join-Path $root ("bag{0}.html" -f $n)))
    $h3Count = [regex]::Matches($html, $h3Pattern).Count
    if ($h3Count -ne 1) { Write-Output "FAIL bag$n.html : $h3Count related-products headings"; $failures++; continue }
    $sectionMatch = [regex]::Match($html, $h3Pattern + '[\s\S]*?<!--\s*' + [regex]::Escape($endComment) + '\s*-->')
    $section = $sectionMatch.Value
    $hrefs = [regex]::Matches($section, 'href="bag(\d+)\.html"')
    if ($hrefs.Count -ne 2) { Write-Output "FAIL bag$n.html : $($hrefs.Count) links in section"; $failures++; continue }
    $selfLink = $false
    foreach ($h in $hrefs) { if ([int]$h.Groups[1].Value -eq $n) { $selfLink = $true } }
    if ($selfLink) { Write-Output "FAIL bag$n.html : links to itself"; $failures++; continue }
    foreach ($h in $hrefs) {
        $t = [int]$h.Groups[1].Value
        if (-not (Test-Path (Join-Path $root ("bag{0}.html" -f $t)))) { Write-Output "FAIL bag$n.html : missing bag$t.html"; $failures++ }
        $img = "bag.jpg"; if ($t -ne 1) { $img = "bag$t.jpg" }
        if (-not (Test-Path (Join-Path $root $img))) { Write-Output "FAIL bag$n.html : missing image $img"; $failures++ }
    }
}
$pHtml2 = [System.IO.File]::ReadAllText($pPath)
if ([regex]::Matches($pHtml2, $h3Pattern).Count -ne 1) { Write-Output "FAIL product.html : heading count"; $failures++ }

if ($failures -eq 0) { Write-Output "ALL CHECKS PASSED for $($bagNums.Count) bag pages + product.html" }
else { Write-Output "FAILURES: $failures" }
Write-Output ("Done. Updated pages: " + $updated)