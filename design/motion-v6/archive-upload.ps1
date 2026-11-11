param([Parameter(Mandatory=$true)][string]$TicketPath,[string]$ProjectDirectory='interactive')
$ErrorActionPreference='Stop'
$ticket=Get-Content -LiteralPath $TicketPath -Raw -Encoding UTF8 | ConvertFrom-Json
$project=Join-Path $PSScriptRoot $ProjectDirectory
$archive=$ticket.nextStep.localArchivePath
$parent=Split-Path -Parent $archive
New-Item -ItemType Directory -Force -Path $parent | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
if(Test-Path -LiteralPath $archive){throw 'Archive already exists; do not overwrite an uploaded archive.'}
$files=Get-ChildItem -LiteralPath $project -File -Recurse -Force
if($files | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }){throw 'Linked source is not permitted.'}
if($files | Where-Object { $_.Name -match '^(\.env.*|package\.json|.*\.private\..*)$' }){throw 'Unexpected source configuration or private file.'}
[IO.Compression.ZipFile]::CreateFromDirectory($project,$archive,[IO.Compression.CompressionLevel]::Optimal,$false)
$zip=[IO.Compression.ZipFile]::OpenRead($archive)
try {
 if(-not ($zip.Entries | Where-Object FullName -eq 'index.html')){throw 'Root index.html missing'}
 foreach($entry in $zip.Entries){if($entry.FullName -match '(^|/)(node_modules|\.git|dist|runtime)(/|$)'){throw 'Excluded directory in archive'}}
 $entries=$zip.Entries.Count
} finally {$zip.Dispose()}
$sha=[Security.Cryptography.SHA256]::Create()
$stream=[IO.File]::OpenRead($archive)
try {$checksum=[Convert]::ToBase64String($sha.ComputeHash($stream))} finally {$stream.Dispose();$sha.Dispose()}
# PowerShell equivalent of the returned POSIX OpenSSL/curl command: identical fields and SHA-256 bytes.
$curlArgs=@('--fail-with-body','--silent','--show-error','--http1.1','--header','Expect:','--connect-timeout','30','--max-time','600','-X','POST',[string]$ticket.upload.submitUrl)
foreach($field in $ticket.upload.fields.PSObject.Properties){$curlArgs+=@('--form-string',"$($field.Name)=$($field.Value)")}
$curlArgs+=@('-F','Content-Type=application/octet-stream','-F',"x-amz-checksum-sha256=$checksum",'-F',('file=@"'+$archive+'";type=application/octet-stream'))
& curl.exe @curlArgs
if($LASTEXITCODE -ne 0){throw "Upload failed (curl $LASTEXITCODE). Do not continue the import."}
Write-Output "Upload succeeded: $entries files, $((Get-Item -LiteralPath $archive).Length) bytes."
