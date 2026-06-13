# IndexNow submission script for intitech.dev
$hostName = "intitech.dev"
$key = "a5a05bc2b439ffc9c9c620bab57b0601"
$keyLocation = "https://intitech.dev/$key.txt"
$sitemapPath = "$PSScriptRoot/sitemap.xml"

if (-not (Test-Path $sitemapPath)) {
    Write-Error "sitemap.xml not found in the current directory."
    exit 1
}

# 1. Parse sitemap.xml to extract URLs
[xml]$sitemap = Get-Content -Raw $sitemapPath
$ns = New-Object System.Xml.XmlNamespaceManager($sitemap.NameTable)
$ns.AddNamespace("ns", "http://www.sitemaps.org/schemas/sitemap/0.9")
$urls = $sitemap.SelectNodes("//ns:loc", $ns) | ForEach-Object { $_.InnerText }

if ($urls.Count -eq 0) {
    Write-Warning "No URLs found in sitemap.xml."
    exit 0
}

Write-Host "Found $($urls.Count) URLs to submit to IndexNow:"
$urls | ForEach-Object { Write-Host " - $_" }

# 2. Build the JSON Payload
$payload = @{
    host = $hostName
    key = $key
    keyLocation = $keyLocation
    urlList = $urls
} | ConvertTo-Json

# 3. Send POST request to IndexNow API
$uri = "https://api.indexnow.org/IndexNow"
Write-Host "Submitting to $uri..."

try {
    $response = Invoke-WebRequest -Uri $uri -Method Post -Body $payload -ContentType "application/json; charset=utf-8" -UseBasicParsing
    Write-Host "Success! HTTP Status: $($response.StatusCode) ($($response.StatusDescription))"
} catch {
    Write-Error "Submission failed: $_"
}
