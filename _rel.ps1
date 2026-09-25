Set-Location 'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)'
$out = New-Object System.Collections.Generic.List[string]
function A($s) { $script:out.Add([string]$s) }

A('=== existing pages ===')
$pages = Get-ChildItem -File -Filter 'bag*.html' | ForEach-Object { [int]($_.BaseName -replace '\D','') } | Sort-Object
A('  bagN.html count = ' + $pages.Count)
A('  ' + ($pages -join ' '))

A('')
A('=== existing bagN.jpg ===')
$imgs = Get-ChildItem -File -Filter 'bag*.jpg' | ForEach-Object { [int]($_.BaseName -replace '\D','') } | Sort-Object
A('  bagN.jpg count = ' + $imgs.Count)
A('  ' + ($imgs -join ' '))
$missing = @()
foreach($n in $imgs) { if ($pages -notcontains $n) { $missing += $n } }
A('  images WITHOUT an individual page : ' + ($missing -join ' '))

A('')
A('=== per-page related products ===')
foreach($p in Get-ChildItem -File -Filter 'bag*.html' | Sort-Object { [int]($_.BaseName -replace '\D','') }) {
  $c = [System.IO.File]::ReadAllText($p.FullName,[System.Text.Encoding]::UTF8)
  $sec = [regex]::Match($c,'(?s)<h3[^>]*>.*?Related Products.*?</h3>(.*?)<!--[^>]*related-products\s*-->')
  if (-not $sec.Success) { $script:out.Add('  ' + $p.BaseName.PadRight(11) + ' *** NO RELATED SECTION ***'); continue }
  $cards = [regex]::Matches($sec.Groups[1].Value,'(?s)<a href="([^"]+)"[^>]*>\s*<img src="([^"]+)" alt="([^"]*)">')
  $h1 = [regex]::Match($c,'<h1[^>]*>(.*?)</h1>').Groups[1].Value.Trim()
  $n = [int]($p.BaseName -replace '\D','')
  $parts = @()
  foreach($m in $cards) { $parts += ($m.Groups[1].Value + ' | ' + $m.Groups[3].Value) }
  $expect = @(($n + 1), ($n + 2)) -join ','
  $script:out.Add('  bag' + $n.ToString().PadRight(3) + ' "' + $h1 + '"')
  $script:out.Add('        cards  : ' + ($parts -join '  ///  '))
  $script:out.Add('        expect next two bag#: ' + $expect)
}
[System.IO.File]::WriteAllLines('_rel.txt',$out.ToArray(),(New-Object System.Text.UTF8Encoding($false)))
Write-Host ('ok ' + $out.Count)