# Launches the Next dev server detached on port 3100 for the Freebuff preview.
# stdout and stderr go to separate files (PowerShell requires this).
$log = 'D:\Development\Projects\madiha portfolio\.freebuff\preview-0888f9e0-0629-4170-9135-7e5d1d16930b.log'
$err = "$log.err"
$p = Start-Process -FilePath 'node.exe' -ArgumentList 'node_modules\next\dist\bin\next','dev','--port','3100' -WorkingDirectory 'D:\Development\Projects\madiha portfolio' -RedirectStandardOutput $log -RedirectStandardError $err -WindowStyle Hidden -PassThru
$p.Id
