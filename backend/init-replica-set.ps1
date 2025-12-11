# PowerShell script to initialize MongoDB replica set
# Run this after starting MongoDB

Write-Host "Initializing MongoDB Replica Set..." -ForegroundColor Green

$MongoShellPath = "C:\Program Files\MongoDB\Server\*\bin\mongosh.exe"
$MongoShellExe = Get-Item $MongoShellPath -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $MongoShellExe) {
    Write-Host "MongoDB Shell (mongosh) not found. Please install MongoDB first." -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
$MongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
if (-not $MongoProcess) {
    Write-Host "MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
    Write-Host "Run: .\start-mongodb-windows.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Connecting to MongoDB..." -ForegroundColor Green

# Initialize replica set
$InitScript = @"
try {
    var status = rs.status();
    print('Replica set already initialized.');
    print('Status: ' + JSON.stringify(status.set));
} catch (e) {
    if (e.message.includes('no replset config')) {
        print('Initializing replica set...');
        var result = rs.initiate({
            _id: 'rs0',
            members: [{ _id: 0, host: 'localhost:27017' }]
        });
        print('Replica set initialized: ' + JSON.stringify(result));
        print('Waiting for replica set to become ready...');
        sleep(3000);
        var status = rs.status();
        print('Replica set status: ' + JSON.stringify(status.set));
    } else {
        print('Error: ' + e.message);
    }
}
"@

# Execute the script
$InitScript | & $MongoShellExe.FullName --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Replica set initialization completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verify status with:" -ForegroundColor Yellow
    Write-Host "mongosh" -ForegroundColor Cyan
    Write-Host "rs.status()" -ForegroundColor Cyan
} else {
    Write-Host "Failed to initialize replica set. Please check MongoDB logs." -ForegroundColor Red
    exit 1
}

