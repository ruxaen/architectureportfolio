[System.Threading.Thread]::Sleep(6000)
$p = Start-Process -FilePath 'node.exe' -ArgumentList 'node_modules\.bin\next','dev','--port','3100' -RedirectStandardOutput 'D:\Development\Projects\madiha portfolio\.freebuff\preview-0888f9e0-0629-4170-9135-7e5d1d16930b.log' -RedirectStandardError 'D:\Development\Projects\madiha portfolio\.freebuff\preview-0888f9e0-0629-4170-9135-7e5d1d16930b.log.err' -WindowStyle Hidden -PassThru
$p.Id
