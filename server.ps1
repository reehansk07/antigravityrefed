# Refed Static HTTP Server (PowerShell)
# Uses HttpListener with localhost-only prefixes (no admin required)
$ports = @(8081, 8082, 8085, 8888, 3000, 9000, 9090)
$rootDir = $PSScriptRoot
$listener = $null
$boundPort = $null

foreach ($port in $ports) {
    try {
        $l = New-Object System.Net.HttpListener
        # Only use localhost prefix — does NOT require admin
        $l.Prefixes.Add("http://localhost:$port/")
        $l.Start()
        $listener = $l
        $boundPort = $port
        break
    } catch {
        # Port in use or unavailable, try next
        if ($l) { try { $l.Close() } catch {} }
    }
}

if (-not $listener) {
    Write-Error "Could not bind to any port. All ports ($($ports -join ', ')) are in use."
    exit 1
}

# Write bound port to a file so tools know exact port
[System.IO.File]::WriteAllText("$rootDir\.active_port", "$boundPort")

Write-Host ""
Write-Host "========================================"
Write-Host "  Refed Web Server running!"
Write-Host "  http://localhost:$boundPort/"
Write-Host "========================================"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server."
Write-Host ""

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
    ".otf"  = "font/otf"
    ".mp4"  = "video/mp4"
    ".webm" = "video/webm"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $relPath = [Uri]::UnescapeDataString($request.Url.LocalPath).TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relPath)) {
            $relPath = "index.html"
        }

        # Normalize path separators for Windows
        $relPath = $relPath -replace '/', '\'
        $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($rootDir, $relPath))

        # Security: ensure resolved path is within rootDir
        if (-not $fullPath.StartsWith($rootDir)) {
            $response.StatusCode = 403
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }

        if ([System.IO.File]::Exists($fullPath)) {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()

                if ($mimeTypes.ContainsKey($ext)) {
                    $response.ContentType = $mimeTypes[$ext]
                } else {
                    $response.ContentType = "application/octet-stream"
                }

                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache")
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)

                $status = "200"
            } catch {
                $response.StatusCode = 500
                $status = "500"
            }
        } else {
            $response.StatusCode = 404
            $body = "404 - File Not Found: $relPath"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $status = "404"
        }

        $response.Close()
        Write-Host "[$status] $($request.HttpMethod) /$relPath"
    }
} finally {
    if ($listener) {
        $listener.Stop()
        $listener.Close()
    }
    Write-Host "Server stopped."
}
