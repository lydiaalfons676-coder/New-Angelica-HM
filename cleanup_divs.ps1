# Clean up formatting of closing divs in bag*.html files
# Replaces runs of </div></div></div> etc. with properly formatted individual lines

$dir = "c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)"
$files = Get-ChildItem $dir -Filter "bag*.html" | Sort-Object { [int]($_.BaseName -replace '\D','') }

foreach ($f in $files) {
    $path = $f.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    
    $original = $content
    
    # Match sequences of </div> that are concatenated on one line (no newlines between them)
    # Replace with each </div> on its own line with proper indentation
    $content = [regex]::Replace($content, '(</div>){2,}', {
        param($m)
        $count = $m.Value.Length / 6  # each </div> is 6 chars
        $result = ""
        for ($i = 0; $i -lt $count; $i++) {
            $result += "`n</div>"
        }
        return $result
    }, [System.Text.RegularExpressions.RegexOptions]::None)
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "CLEANED: $($f.Name)"
    } else {
        Write-Host "NO CHANGE: $($f.Name)"
    }
}

Write-Host "Done!"