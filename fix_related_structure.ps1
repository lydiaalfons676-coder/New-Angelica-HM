# Fix Related Products layout in bag*.html files to match bag1.html structure
# Moves the Related Products block OUTSIDE .product-page div

$dir = "c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)"
$files = Get-ChildItem $dir -Filter "bag*.html" | Sort-Object { [int]($_.BaseName -replace '\D','') }

$relatedEnd = '</div>   <!-- nahaie related-products -->'

# We need to find the actual non-ASCII end marker. Let's use a regex pattern instead.
# The related block ends with a comment containing Arabic text
# Let's use a pattern that matches: </div> followed by optional whitespace then <!-- ... related-products ... -->
$endPattern = '</div>\s*<!--.*?related-products.*-->'

foreach ($f in $files) {
    $path = $f.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    
        # The shopping bag emoji is U+1F9EE (🛍️)
    # The string we're looking for is: 🛍️ Related Products</h3>
    # But in the HTML it's actually: <h3>👜 Related Products</h3> (with a different emoji)
    # Let's search for "Related Products" directly to avoid emoji issues
    
    $relatedH3 = 'Related Products</h3>'
    $h3Idx = $content.IndexOf($relatedH3)
    if ($h3Idx -lt 0) {
        Write-Host "SKIP (no related): $($f.Name)"
        continue
    }
    
    # Find preceding <hr>
    $hrIdx = $content.LastIndexOf('<hr>', $h3Idx)
    if ($hrIdx -lt 0) {
        Write-Host "SKIP (no hr before related): $($f.Name)"
        continue
    }
    
    # Find end of related-products div using regex
    $endMatch = [regex]::Match($content, '</div>\s*<!--.*?related-products.*?-->', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if (-not $endMatch.Success -or $endMatch.Index -lt $h3Idx) {
        Write-Host "SKIP (no end marker): $($f.Name)"
        continue
    }
    $endIdx = $endMatch.Index + $endMatch.Length
    
    # Extract the related block
    $relatedBlock = $content.Substring($hrIdx, $endIdx - $hrIdx)
    
    # Content after related block
    $after = $content.Substring($endIdx)
    
    # Find script tag
    $scriptIdx = $after.IndexOf('<script src="script.js')
    if ($scriptIdx -lt 0) {
        $scriptIdx = $after.IndexOf('<script>')
    }
    if ($scriptIdx -lt 0) {
        Write-Host "SKIP (no script): $($f.Name)"
        continue
    }
    
    $between = $after.Substring(0, $scriptIdx)
    
    # Count orphaned </div> in between
    $closeCount = ([regex]::Matches($between, '</div>').Count)
    
    if ($closeCount -eq 0) {
        Write-Host "ALREADY OK: $($f.Name)"
        continue
    }
    
    # Remove orphaned closing divs from 'between'
    $newBetween = $between
    for ($i = 0; $i -lt $closeCount; $i++) {
        $idx = $newBetween.IndexOf('</div>')
        if ($idx -ge 0) {
            $newBetween = $newBetween.Remove($idx, 6)
        }
    }
    
    # Insert closing divs before related block
    $closingDivs = ('</div>' * $closeCount) + "`n"
    
    # Reconstruct
    $newContent = $content.Substring(0, $hrIdx) + $closingDivs + $relatedBlock + $newBetween + $after.Substring($scriptIdx)
    
    [System.IO.File]::WriteAllText($path, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "FIXED: $($f.Name) (moved $closeCount closing divs)"
}

Write-Host ""
Write-Host "Done!"