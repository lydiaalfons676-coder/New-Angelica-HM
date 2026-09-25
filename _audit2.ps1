Set-Location 'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)'
$out = New-Object System.Collections.Generic.List[string]
function A($s) { $script:out.Add([string]$s) }

# ---- build bagPageNames the same way script.js does ----
$js = [System.IO.File]::ReadAllText('script.js',[System.Text.Encoding]::UTF8)
$m = [regex]::Match($js,'(?s)const liveBagNames = \[(.*?)\];')
$names = @()
foreach($q in [regex]::Matches($m.Groups[1].Value,'"((?:[^"\\]|\\.)*)"')) { $names += $q.Groups[1].Value }
A('liveBagNames count = ' + $names.Count)

$bagPageNames = @{}
for($i=0; $i -lt $names.Count; $i++) {
  $bn = 0
  if ($i -lt 6) { $bn = $i + 1 } elseif ($i -lt 35) { $bn = $i + 2 } else { $bn = $i + 3 }
  $bagPageNames[$bn] = $names[$i]
}
$ov = [regex]::Match($js,'(?s)Object\.assign\(bagPageNames, \{(.*?)\}\);')
foreach($p in [regex]::Matches($ov.Groups[1].Value,'(\d+):\s*"((?:[^"\\]|\\.)*)"')) {
  $bagPageNames[[int]$p.Groups[1].Value] = $p.Groups[2].Value
}
A('bagPageNames total keys = ' + $bagPageNames.Count)

A('')
A('=== bagPageNames 55..70 ===')
foreach($k in 55..70) {
  if ($bagPageNames.ContainsKey($k)) { A('  ' + $k.ToString().PadRight(4) + $bagPageNames[$k]) }
  else { A('  ' + $k.ToString().PadRight(4) + '*** MISSING ***') }
}

A('')
A('=== missing names for existing images (1..70 minus gaps 7,37) ===')
$gaps = @(7,37)
$missing = @()
foreach($k in 1..70) {
  if ($gaps -contains $k) { continue }
  if (-not $bagPageNames.ContainsKey($k)) { $missing += $k }
}
if ($missing.Count -eq 0) { A('  none - every image 1..70 has a name') } else { A('  MISSING: ' + ($missing -join ', ')) }

# ---- expected next-two helper (mirrors getNextBagNumbers) ----
function NextTwo([int]$n) {
  $res = @(); $cur = $n
  for($s=0; $s -lt 70 -and $res.Count -lt 2; $s++) {
    if ($cur -ge 70) { $cur = 1 } else { $cur = $cur + 1 }
    if ($gaps -notcontains $cur) { $res += $cur }
  }
  return ,$res
}

# ---- audit every bagN.html hardcoded related section ----
A('')
A('=== bagN.html related-products vs expected next-two ===')
$badCount = 0
foreach($p in Get-ChildItem -File -Filter 'bag*.html' | Sort-Object { [int]($_.BaseName -replace '\D','') }) {
  $n = [int]($p.BaseName -replace '\D','')
  $c = [System.IO.File]::ReadAllText($p.FullName,[System.Text.Encoding]::UTF8)
  $sec = [regex]::Match($c,'(?s)<h3[^>]*>.*?Related Products.*?</h3>(.*?)<!--[^>]*related-products\s*-->')
  if (-not $sec.Success) { A('  bag' + $n + ' *** NO RELATED SECTION ***'); $badCount++; continue }

  $gotHrefs = @(); $gotNames = @()
  foreach($mm in [regex]::Matches($sec.Groups[1].Value,'(?s)<a href="([^"]+)"[^>]*>\s*<img src="([^"]+)" alt="([^"]*)">')) {
    $gotHrefs += $mm.Groups[1].Value; $gotNames += $mm.Groups[3].Value
  }

  $exp = NextTwo $n
  $expHrefs = @(); $expNames = @()
  foreach($e in $exp) {
    if ($e -le 62) { $expHrefs += "bag$e.html" } else { $expHrefs += "product.html?name=$([System.Uri]::EscapeDataString($bagPageNames[$e]))&image=bag$e.jpg" }
    $expNames += $bagPageNames[$e]
  }

  $hrefOk = (($gotHrefs -join '|') -eq ($expHrefs -join '|'))
  $nameOk = (($gotNames -join '|') -eq ($expNames -join '|'))
  if ($hrefOk -and $nameOk) { continue }

  $badCount++
  $script:out.Add('  bag' + ([string]$n).PadRight(3) + ' MISMATCH')
  $script:out.Add('        got hrefs : ' + ($gotHrefs -join '  ///  '))
  $script:out.Add('        exp hrefs : ' + ($expHrefs -join '  ///  '))
  if (-not $nameOk) {
    $script:out.Add('        got names : ' + ($gotNames -join '  ///  '))
    $script:out.Add('        exp names : ' + ($expNames -join '  ///  '))
  }
}
A('  pages with mismatched related products = ' + $badCount)

# ---- what product.html will render for the "no own page" bags ----
A('')
A('=== product.html dynamic output (bags 63..70) ===')
foreach($n in 63..70) {
  $exp = NextTwo $n
  $txt = @()
  foreach($e in $exp) { $txt += ("bag$e = " + $bagPageNames[$e]) }
  A('  bag' + $n.ToString().PadRight(3) + '(' + $bagPageNames[$n] + ')  ->  ' + ($txt -join '   ///   '))
}

A('')
A('=== the specific card the user asked about ===')
A('  Beige Jute Bag With a White Bow = bag' + (($bagPageNames.GetEnumerator() | Where-Object { $_.Value -eq 'Beige Jute Bag With a White Bow' }).Key))
$exp61 = NextTwo 61
A('  its related products should be:')
foreach($e in $exp61) { A('     bag' + $e + ' -> ' + $bagPageNames[$e]) }

[System.IO.File]::WriteAllLines('_audit2.txt',$out.ToArray(),(New-Object System.Text.UTF8Encoding($false)))
Write-Host ('ok ' + $out.Count)