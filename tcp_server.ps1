# Bulletproof TCP Static HTTP Server for Refed (AR ORBIT)
$port = 8081
$rootDir = "c:\Users\shaik\OneDrive\Desktop\AR ORBIT"
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)

try {
    $listener.Start()
    Write-Host "TCP Web Server listening on 0.0.0.0:$port..."
    [System.IO.File]::WriteAllText("$rootDir\.active_port", "$port")
} catch {
    $port = 8082
    $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
    $listener.Start()
    Write-Host "TCP Web Server listening on 0.0.0.0:$port..."
    [System.IO.File]::WriteAllText("$rootDir\.active_port", "$port")
}

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()

        if ($requestLine) {
            $parts = $requestLine.Split(' ')
            $path = $parts[1].Split('?')[0].TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($path)) { $path = "index.html" }

            $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($rootDir, $path))

            if ([System.IO.File]::Exists($fullPath)) {
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()

                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".svg"  { "image/svg+xml" }
                    ".json" { "application/json" }
                    default { "application/octet-stream" }
                }

                $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)

                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($bytes, 0, $bytes.Length)
            } else {
                $notFound = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: 13`r`nConnection: close`r`n`r`n404 Not Found"
                $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes($notFound)
                $stream.Write($notFoundBytes, 0, $notFoundBytes.Length)
            }
        }
        $client.Close()
    } catch {
        # ignore client errors
    }
}
