Set-Location 'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)'
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
$base = 'file:///C:/Users/compuremo/Desktop/New%20Angelica%20HM%20-%20Copy%20(2)/'

# pages to render like a real browser
$targets = @()
foreach($n in 1..62) { if (Test-Path ("bag{0}.html" -f $n)) { $targets += @{ label = "bag$n"; url = "bag$n.html" } } }
foreach($n in 63..70) { $targets += @{ label = "product.html?image=bag$n.jpg"; url = ("product.html?name=X&image=bag{0}.jpg" -f $n) } }

$out = New-Object System.Collections.Generic.List[string]
function A($s) { $script:out.Add([string]$s) }

foreach($t in $targets) {
  $o = '_r.out.txt'
  $null = Start-Process -FilePath $edge -ArgumentList @('--headless','--disable-gpu','--virtual-time-budget=3000','--dump-dom', ($base + $t.url)) -NoNewWindow -Wait -PassThru -RedirectStandardOutput $o -RedirectStandardError '_r.err.txt'
  $dom = [System.IO.File]::ReadAllText((Resolve-Path $o),[System.Text.Encoding]::UTF8)
  $sec = [regex]::Match($dom,'(?s)<div class="related-products"[^>]*>(.*?)</div>\s*(?:<!--|<hr|</body)')
  if (-not $sec.Success) { A($t.label.PadRight(30) + '  *** section not found ***'); continue }
  $cards = [regex]::Matches($sec.Groups[1].Value,'(?s)<a href="([^"]+)"[^>]*>\s*<img src="([^"]+)" alt="([^"]*)">\s*<p>(.*?)</p>')
  $parts = @()
  foreach($m in $cards) {
    $parts += ('[' + $m.Groups[2].Value + '] ' + $m.Groups[3].Value + ' -> ' + $m.Groups[1].Value)
  }
  A($t.label.PadRight(30) + '  count=' + $cards.Count + '  ' + ($parts -join '   ||   '))
}
Remove-Item -Force '_r.out.txt','_r.err.txt' -ErrorAction SilentlyContinue
[System.IO.File]::WriteAllLines('_rendered.txt',$out.ToArray(),(New-Object System.Text.UTF8Encoding($false)))
Write-Host ('ok ' + $out.Count)