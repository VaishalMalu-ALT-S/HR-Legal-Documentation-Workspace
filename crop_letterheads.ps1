Add-Type -AssemblyName System.Drawing
function CropImage($src, $dst, $x, $y, $w, $h) {
    $bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $src).Path)
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
    $cropped.Save((Join-Path (Get-Location) $dst), [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $cropped.Dispose()
    $bmp.Dispose()
    Write-Host "Cropped $dst successfully"
}

# 2544 x 3504 dimensions
# Page 1: Link ERP
CropImage "public/linkerp_letterhead.jpg" "public/linkerp_header.jpg" 0 0 2544 420
CropImage "public/linkerp_letterhead.jpg" "public/linkerp_footer.jpg" 0 3240 2544 264

# Page 2: Sifratech
CropImage "public/sifratech_letterhead.jpg" "public/sifratech_header.jpg" 0 0 2544 420
CropImage "public/sifratech_letterhead.jpg" "public/sifratech_footer.jpg" 0 3240 2544 264

# Page 3: ALT-S
CropImage "public/alts_letterhead.jpg" "public/alts_header.jpg" 0 0 2544 420
CropImage "public/alts_letterhead.jpg" "public/alts_footer.jpg" 0 3180 2544 324
