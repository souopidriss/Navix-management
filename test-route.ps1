$ErrorActionPreference = "SilentlyContinue"
$urls = @(
    "http://localhost:5173/dashboard/sa-finance",
    "http://localhost:5173/dashboard/sa-finance/transactions",
    "http://localhost:5173/dashboard",
    "http://localhost:5173/dashboard/billing",
    "http://localhost:5173/dashboard/partners"
)
foreach ($url in $urls) {
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 8
        Write-Host "$url => $($resp.StatusCode)"
    } catch {
        Write-Host "$url => $($_.Exception.Message)"
    }
}
