$routes = @('/partner/dashboard', '/partner/calendar', '/partner/alerts', '/partner/support')
foreach ($route in $routes) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:5173$route" -UseBasicParsing -TimeoutSec 10
        Write-Output "ROUTE $route -> HTTP $($r.StatusCode)"
    } catch {
        Write-Output "ROUTE $route -> ERROR: $($_.Exception.Message)"
    }
}
