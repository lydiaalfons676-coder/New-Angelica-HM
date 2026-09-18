Set-Location 'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)'
$out = New-Object System.Collections.Generic.List[string]
function A($s) { $script:out.Add([string]$s) }

A('=== which bagN.jpg exist in root (1..70) ===')
$missing = @()
for($n=1; $n -le 70; $n++){
  $f = if($n -eq 1){ 'bag.jpg' } else { "bag$n.jpg" }
  if(-not (Test-Path $f)){ $missing += $n }
}
A('  MISSING images : ' + ($missing -join ', '))
A('  declared bagImageGaps in script.js : ' + ((Select-String -Path 'script.js' -Pattern 'const bagImageGaps = \[([^\]]*)\]' ).Matches.Groups[1].Value.Trim()))

A('')
A('=== where bag5 / bag7 / bag37 images actually live ===')
foreach($n in @(5,7,37)){
  $root = "bag$n.jpg"
  $hits = Get-ChildItem -Recurse -File -Filter "bag$n.jpg" | ForEach-Object { $_.FullName.Replace((Get-Location).Path + '\','') }
  A('  bag' + $n + '.jpg in root : ' + (Test-Path $root) + '   | found at: ' + ($hits -join ' ;; '))
}

A('')
A('=== image path used by STATIC pages for bag5 related cards ===')
Get-ChildItem -File -Filter 'bag*.html' | ForEach-Object {
  $c = [System.IO.File]::ReadAllText($_.FullName,[System.Text.Encoding]::UTF8)
  foreach($m in [regex]::Matches($c,'<img src="([^"]*bag5[^"]*)"')){
    $script:out.Add('  ' + $_.Name + ' -> ' + $m.Groups[1].Value)
  }
}

A('')
A('=== bagPageNames: keys present 1..70 ===')
$js = [System.IO.File]::ReadAllText('script.js',[System.Text.Encoding]::UTF8)
$block = [regex]::Match($js,'(?s)Object\.assign\(bagPageNames, \{(.*?)\}\);').Groups[1].Value
A('  explicit overrides block:')
foreach($m in [regex]::Matches($block,'(\d+):\s*"([^"]*)"')){ A('    ' + $m.Groups[1].Value.PadLeft(3) + ' -> ' + $m.Groups[2].Value) }
A('  liveBagNames count : ' + ([regex]::Matches($js,'(?s)const liveBagNames = \[(.*?)\];').Groups[1].Value.Split("`n").Count))
[System.IO.File]::WriteAllLines('_gaps.txt',$out.ToArray(),(New-Object System.Text.UTF8Encoding($false)))
Write-Host ('ok ' + $out.Count)