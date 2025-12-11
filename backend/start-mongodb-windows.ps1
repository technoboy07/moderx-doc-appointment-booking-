# PowerShell script to start MongoDB with replica set on Windows
# Run this script as Administrator

Write-Host "Starting MongoDB with Replica Set..." -ForegroundColor Green

$MongoDBPath = "C:\Program Files\MongoDB\Server\*\bin\mongod.exe"
$MongoDBExe = Get-Item $MongoDBPath -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $MongoDBExe) {
    Write-Host "MongoDB not found. Please install MongoDB first." -ForegroundColor Red
    Write-Host "Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

$DataPath = "C:\data\db"
$LogPath = "C:\data\log"

# Create directories if they don't exist
if (-not (Test-Path $DataPath)) {
    New-Item -ItemType Directory -Path $DataPath -Force | Out-Null
    Write-Host "Created data directory: $DataPath" -ForegroundColor Green
}

if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
    Write-Host "Created log directory: $LogPath" -ForegroundColor Green
}

# Check if MongoDB is already running
$MongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
if ($MongoProcess) {
    Write-Host "MongoDB is already running (PID: $($MongoProcess.Id))" -ForegroundColor Yellow
    Write-Host "To restart, stop it first: net stop MongoDB" -ForegroundColor Yellow
    exit 0
}

# Start MongoDB with replica set
Write-Host "Starting MongoDB..." -ForegroundColor Green
$MongoDBArgs = @(
    "--replSet", "rs0",
    "--dbpath", $DataPath,
    "--logpath", "$LogPath\mongod.log",
    "--port", "27017"
)

Start-Process -FilePath $MongoDBExe.FullName -ArgumentList $MongoDBArgs -WindowStyle Hidden

# Wait for MongoDB to start
Start-Sleep -Seconds 5

# Check if MongoDB started successfully
$MongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
if ($MongoProcess) {
    Write-Host "MongoDB started successfully (PID: $($MongoProcess.Id))" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Initialize replica set:" -ForegroundColor Yellow
    Write-Host "   mongosh" -ForegroundColor Cyan
    Write-Host "   rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Verify replica set status:" -ForegroundColor Yellow
    Write-Host "   rs.status()" -ForegroundColor Cyan
} else {
    Write-Host "Failed to start MongoDB. Check logs at: $LogPath\mongod.log" -ForegroundColor Red
    exit 1
}

