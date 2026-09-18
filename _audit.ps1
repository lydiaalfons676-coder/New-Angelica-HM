Set-Location 'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)'
$out = New-Object System.Collections.Generic.List[string]
function A($s) { $script:out.Add([string]$s) }

# نفس ألگوريتم getNextBagNumbers الموجود فى script.js
$gaps = @(7, 37); $last = 70
function NextNums($n, $count) {
  $res = @(); $cur = $n
  for ($s = 0; $s -lt $last -and $res.Count -lt $count; $s++) {
    $cur = if ($cur -ge $last) { 1 } else { $cur + 1 }
    if ($gaps -notcontains $cur) { $res += $cur }
  }
  return $res
}
function ImgOf($n) { if ($n -eq 1) { 'bag.jpg' } else { "bag$n.jpg" } }
function PageOf($n) { if ($n -le 62) { "bag$n.html" } else { 'product.html?...' } }

# اسم كل صفحة من الـ h1 (للتشخيص بس)
$titles = @{}
foreach ($p in Get-ChildItem -File -Filter 'bag*.html') {
  $n = [int]($p.BaseName -replace '\D', '')
  $c = [System.IO.File]::ReadAllText($p.FullName, [System.Text.Encoding]::UTF8)
  $titles[$n] = [regex]::Match($c, '<h1[^>]*>(.*?)</h1>').Groups[1].Value.Trim()
}

A('=== AUDIT: related products of every bagN.html ===')
$bad = New-Object System.Collections.Generic.List[string]
foreach ($p in Get-ChildItem -File -Filter 'bag*.html' | Sort-Object { [int]($_.BaseName -replace '\D', '') }) {
  $n = [int]($p.BaseName -replace '\D', '')
  $c = [System.IO.File]::ReadAllText($p.FullName, [System.Text.Encoding]::UTF8)
  $sec = [regex]::Match($c, '(?s)<h3[^>]*>[^<]*Related Products</h3>(.*?)<!--[^>]*related-products\s*-->')
  if (-not $sec.Success) { $bad.Add("bag$n : NO SECTION"); continue }
  $cards = [regex]::Matches($sec.Groups[1].Value, '(?s)<a href="([^"]+)"[^>]*>\s*<img src="([^"]+)" alt="([^"]*)">')
  $exp = NextNums $n 2
  $issues = @()
  if ($cards.Count -ne 2) { $issues += "card count=$($cards.Count)" }
  for ($k = 0; $k -lt [Math]::Min(2, $cards.Count); $k++) {
    $e = $exp[$k]
    $href = $cards[$k].Groups[1].Value
    $img  = $cards[$k].Groups[2].Value
    $alt  = $cards[$k].Groups[3].Value
    if ($img -ne (ImgOf $e)) { $issues += "card$($k+1): img=$img expected " + (ImgOf $e) }
    $expHref = if ($e -le 62) { "bag$e.html" } else { "product.html?name=" }
    if ($e -le 62) { if ($href -ne $expHref) { $issues += "card$($k+1): href=$href expected $expHref" } }
    else { if (-not $href.StartsWith($expHref)) { $issues += "card$($k+1): href=$href expected product.html?name=...&image=" + (ImgOf $e) }
           elseif (-not $href.Contains("image=" + (ImgOf $e))) { $issues += "card$($k+1): href missing image=" + (ImgOf $e) } }
  }
  if ($issues.Count) {
    $bad.Add("bag$n  (""" + $titles[$n] + """)")
    foreach ($i in $issues) { $bad.Add('        - ' + $i) }
    $script:out.Add('  bag' + $n.ToString().PadRight(3) + ' *** WRONG ***')
    $script:out.Add('        actual  : ' + (($cards | ForEach-Object { $_.Groups[2].Value }) -join ' , '))
    $script:out.Add('        expected: ' + ((ImgOf $exp[0]) + ' , ' + (ImgOf $exp[1])))
  }
}
A('')
A('  pages needing a fix = ' + $bad.Count)
A('')
A('=== details ===')
foreach ($b in $bad) { $script:out.Add('  ' + $b) }

A('')
A('=== product.html dynamic renderer ===')
$prd = [System.IO.File]::ReadAllText('product.html', [System.Text.Encoding]::UTF8)
A('  id="related-products" present : ' + $prd.Contains('id="related-products"'))
A('  renderer present              : ' + $prd.Contains("document.getElementById('related-products')"))
A('  uses getNextBagNumbers        : ' + $prd.Contains('getNextBagNumbers'))
A('  uses getBagLinkData           : ' + $prd.Contains('getBagLinkData'))
A('  uses getBagNumberFromImage    : ' + $prd.Contains('getBagNumberFromImage'))
$js = [System.IO.File]::ReadAllText('script.js', [System.Text.Encoding]::UTF8)
A('  helpers in script.js          : ' + ($js.Contains('function getNextBagNumbers') -and $js.Contains('function getBagLinkData') -and $js.Contains('function getBagNumberFromImage')))
A('  gaps/last declared            : ' + $js.Contains('const bagImageGaps = [7, 37];') + ' / ' + $js.Contains('const lastBagNumber = 70;'))
A('  bagPageNames keys 63..70      : ' + ($prd.Contains('bagPageNames') -or $js.Contains('63: "Beige Cordon Bag"')))
[System.IO.File]::WriteAllLines('_audit.txt', $out.ToArray(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host ('ok ' + $out.Count)