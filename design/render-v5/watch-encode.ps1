$chefRenderKeys = @('hawawshi','halloumi','bolognese','pesto','pizza','souvlaki','taameya','ful','liver','spanakopita','gyro')
foreach ($chefRenderKey in $chefRenderKeys) {
    if (Test-Path -LiteralPath "design/render-v5/$chefRenderKey-3d-poster.png") { continue }
    $chefRenderLog = "design/render-v5/$chefRenderKey-render.log"
    while (-not (Select-String -LiteralPath $chefRenderLog -Pattern "^DONE $chefRenderKey film" -Quiet -ErrorAction SilentlyContinue)) { Start-Sleep -Seconds 5 }
    python design/render-v5/encode.py $chefRenderKey
    if ($LASTEXITCODE -ne 0) { throw "Encoding failed: $chefRenderKey" }
}
Write-Output 'All 12 animations encoded'
