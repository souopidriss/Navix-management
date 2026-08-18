$routes = @(
    '/partner/dashboard',
    '/partner/calendar',
    '/partner/alerts',
    '/partner/support',
    '/partner/contracts',
    '/partner/clients',
    '/partner/vehicles',
    '/partner/missions',
    '/partner/revenue',
    '/partner/invoices',
    '/partner/funds',
    '/partner/analytics',
    '/partner/documents',
    '/partner/notifications',
    '/partner/requests',
    '/partner/settings',
    '/partner/profile'
)
foreach ($route in $routes) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:5173$route" -UseBasicParsing -TimeoutSec 10
        Write-Output "OK  $route -> HTTP $($r.StatusCode)"
    } catch {
        Write-Output "ERR $route -> $($_.Exception.Message)"
    }
}
