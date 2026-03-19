# Download gallery images for Action Divers Belize
$images = @{
    "belize-barrier-reef-diving.jpg" = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&auto=format&fit=crop"
    "hol-chan-snorkeling.jpg" = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop"
    "belize-sunset-diving.jpg" = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop"
    "caye-caulker-snorkeling.jpg" = "https://images.unsplash.com/photo-1593795287625-2e8b0c4ae5f3?w=1200&auto=format&fit=crop"
    "belize-beach-bbq.jpg" = "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=1200&auto=format&fit=crop"
    "belize-deep-sea-fishing.jpg" = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop"
    "lamanai-maya-ruins.jpg" = "https://images.unsplash.com/photo-1502904550090-2a5a5b4c4b9e?w=1200&auto=format&fit=crop"
    "belize-cave-tubing.jpg" = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop"
    "belize-sunset-beach.jpg" = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop"
    "belize-coral-reef.jpg" = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&auto=format&fit=crop"
    "belize-sailboat.jpg" = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop"
    "belize-mangroves.jpg" = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop"
}

$galleryPath = "public/images/gallery"

foreach ($imageName in $images.Keys) {
    $url = $images[$imageName]
    $outputPath = Join-Path $galleryPath $imageName
    
    Write-Host "Downloading $imageName from $url..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath -ErrorAction Stop
        Write-Host "Downloaded $imageName" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download $imageName`: $_" -ForegroundColor Red
    }
}

Write-Host "Download complete!" -ForegroundColor Cyan
