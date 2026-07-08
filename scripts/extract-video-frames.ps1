param(
  [string]$VideoPath,
  [string]$OutputDir
)

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName WindowsBase

if (-not (Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$times = @(1, 4, 8, 12, 16, 20)
$width = 960
$height = 540

$player = New-Object System.Windows.Media.MediaPlayer
$resolvedVideoPath = (Resolve-Path -LiteralPath $VideoPath).Path
$player.Open([Uri]$resolvedVideoPath)
$player.Volume = 0
Start-Sleep -Milliseconds 1200

for ($i = 0; $i -lt $times.Count; $i++) {
  $player.Position = [TimeSpan]::FromSeconds($times[$i])
  Start-Sleep -Milliseconds 700

  $drawingVisual = New-Object System.Windows.Media.DrawingVisual
  $context = $drawingVisual.RenderOpen()
  $rect = New-Object System.Windows.Rect(0, 0, $width, $height)
  $context.DrawVideo($player, $rect)
  $context.Close()

  $bitmap = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($width, $height, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $bitmap.Render($drawingVisual)

  $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))

  $file = Join-Path $OutputDir ("frame-{0:D2}.png" -f ($i + 1))
  $stream = [System.IO.File]::Open($file, [System.IO.FileMode]::Create)
  $encoder.Save($stream)
  $stream.Close()
}

$player.Close()
