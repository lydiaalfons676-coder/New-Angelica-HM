# Fix related products h3 class in all bag*.html files
# Adds class="related-title" to <h3> tags that say "Related Products"

$dir = "c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)"
$files = Get-ChildItem $dir -Filter "bag*.html" | Sort-Object { [int]($_.BaseName -replace '\D','') }

foreach ($f in $files) {
    $path = $f.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $original = $content
    
    # Replace <h3>[emoji] Related Products</h3> with <h3 class="related-title">[emoji] Related Products</h3>
    # But only if it doesn't already have class=
    $content = [regex]::Replace($content, '<h3>([^<]*Related Products</h3>)', '<h3 class="related-title">$1', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "FIXED: $($f.Name)"
    } else {
        Write-Host "NO CHANGE: $($f.Name)"
    }
}

Write-Host ""
Write-Host "Done!"