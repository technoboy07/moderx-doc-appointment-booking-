# Windows Setup Guide

This guide provides Windows-specific instructions for setting up the Doctor Appointment Booking System.

## Prerequisites

### 1. Install Node.js

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the LTS version (v18 or higher recommended)
3. Run the installer and follow the setup wizard
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### 2. Install MongoDB

#### Option A: MongoDB Community Server (Recommended)

1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Choose Windows x64 installer
3. Run the installer:
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)
4. MongoDB will be installed to `C:\Program Files\MongoDB\Server\<version>\`

#### Option B: MongoDB via Chocolatey

```powershell
# Install Chocolatey first if you don't have it
# Then install MongoDB
choco install mongodb
```

### 3. Configure MongoDB as Replica Set (Required for Transactions)

MongoDB transactions require a replica set, even for single-node development.

#### Method 1: Using MongoDB Configuration File (Recommended)

1. Create a configuration file `C:\data\mongodb\mongod.cfg`:
   ```yaml
   storage:
     dbPath: C:\data\db
   replication:
     replSetName: rs0
   net:
     port: 27017
     bindIp: localhost
   ```

2. Create the data directory:
   ```powershell
   mkdir C:\data\db
   ```

3. Start MongoDB with the config file:
   ```powershell
   # If MongoDB is installed as a service, stop it first
   net stop MongoDB

   # Start MongoDB manually with config
   "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --config "C:\data\mongodb\mongod.cfg"
   ```

4. In a new PowerShell window, initialize the replica set:
   ```powershell
   "C:\Program Files\MongoDB\Server\<version>\bin\mongosh.exe"
   ```
   
   Then in mongosh:
   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [{ _id: 0, host: "localhost:27017" }]
   })
   ```

5. Verify replica set status:
   ```javascript
   rs.status()
   ```

#### Method 2: Using Command Line Arguments

1. Stop MongoDB service:
   ```powershell
   net stop MongoDB
   ```

2. Start MongoDB with replica set:
   ```powershell
   "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --replSet rs0 --dbpath C:\data\db --port 27017
   ```

3. In a new terminal, initialize replica set (same as Method 1, step 4)

#### Method 3: Using Windows Service (Permanent Solution)

1. Create/edit MongoDB service configuration:
   ```powershell
   # Stop the service
   net stop MongoDB

   # Remove existing service (if needed)
   sc delete MongoDB

   # Create new service with replica set
   "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --install --serviceName MongoDB --replSet rs0 --dbpath C:\data\db --logpath C:\data\log\mongod.log
   ```

2. Start the service:
   ```powershell
   net start MongoDB
   ```

3. Initialize replica set (same as Method 1, step 4)

### 4. Verify MongoDB is Running

```powershell
# Check if MongoDB is running
net start | findstr MongoDB

# Or connect to MongoDB shell
"C:\Program Files\MongoDB\Server\<version>\bin\mongosh.exe"
```

## Project Setup

### 1. Clone/Navigate to Project

```powershell
cd C:\moderx
```

### 2. Backend Setup

```powershell
cd backend

# Install dependencies
npm install

# Create .env file
# Use Notepad or PowerShell
notepad .env
```

Add to `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/doctor_appointments
NODE_ENV=development
```

### 3. Seed Database

```powershell
npm run seed
```

### 4. Start Backend Server

```powershell
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

### 5. Frontend Setup (New Terminal)

```powershell
cd C:\moderx\frontend

# Install dependencies
npm install

# Create .env file
notepad .env
```

Add to `.env`:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### 6. Start Frontend

```powershell
npm start
```

The frontend will open automatically in your browser at `http://localhost:3000` (or next available port).

## Common Windows Issues & Solutions

### Issue 1: MongoDB Service Won't Start

**Solution:**
```powershell
# Check MongoDB logs
type "C:\Program Files\MongoDB\Server\<version>\log\mongod.log"

# Common fix: Ensure data directory exists and has proper permissions
mkdir C:\data\db
icacls C:\data\db /grant Users:F
```

### Issue 2: Port 27017 Already in Use

**Solution:**
```powershell
# Find process using port 27017
netstat -ano | findstr :27017

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 3: Replica Set Not Initialized

**Symptoms:** Transactions fail with "not master" error

**Solution:**
```powershell
# Connect to MongoDB
mongosh

# Check replica set status
rs.status()

# If not initialized, run:
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "localhost:27017" }]
})

# Wait a few seconds, then check status again
rs.status()
```

### Issue 4: Node Modules Installation Fails

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### Issue 5: Permission Denied Errors

**Solution:**
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell -> Run as Administrator

# Or grant permissions to project folder
icacls C:\moderx /grant Users:F /T
```

### Issue 6: MongoDB Compass Connection Issues

If using MongoDB Compass GUI:
- Connection string: `mongodb://localhost:27017`
- If replica set is configured, use: `mongodb://localhost:27017/?replicaSet=rs0`

## Windows-Specific Tips

### 1. Using PowerShell vs Command Prompt

- **PowerShell** (recommended): More modern, better for scripting
- **Command Prompt**: Traditional Windows terminal

Both work, but PowerShell is preferred for Node.js development.

### 2. Paths with Spaces

If your project path has spaces, use quotes:
```powershell
cd "C:\My Projects\moderx"
```

### 3. Environment Variables

Windows uses different syntax:
```powershell
# PowerShell
$env:MONGODB_URI="mongodb://localhost:27017/doctor_appointments"

# Command Prompt
set MONGODB_URI=mongodb://localhost:27017/doctor_appointments
```

### 4. Running Multiple Terminals

You'll need multiple terminals for:
1. MongoDB (if running manually)
2. Backend server (`npm run dev`)
3. Frontend server (`npm start`)

**Tip:** Use Windows Terminal or VS Code integrated terminal for better experience.

### 5. MongoDB Data Location

Default MongoDB data directory on Windows:
- `C:\data\db` (if created manually)
- Or MongoDB installation directory

Check your MongoDB config file for the actual path.

## Quick Start Script (PowerShell)

Create a file `start-dev.ps1`:

```powershell
# Start MongoDB (if not running as service)
Start-Process "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" -ArgumentList "--replSet rs0 --dbpath C:\data\db"

# Wait for MongoDB to start
Start-Sleep -Seconds 5

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
```

Run with:
```powershell
.\start-dev.ps1
```

## VS Code Integration

If using VS Code:

1. Install extensions:
   - ESLint
   - Prettier
   - MongoDB for VS Code (optional)

2. Use integrated terminal:
   - Terminal 1: Backend
   - Terminal 2: Frontend
   - Terminal 3: MongoDB commands (if needed)

3. Debug configuration:
   Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Launch Backend",
         "program": "${workspaceFolder}/backend/src/server.js",
         "env": {
           "NODE_ENV": "development"
         }
       }
     ]
   }
   ```

## Troubleshooting Checklist

- [ ] Node.js installed and in PATH
- [ ] MongoDB installed and running
- [ ] MongoDB configured as replica set
- [ ] Data directory exists (`C:\data\db`)
- [ ] Port 27017 not blocked by firewall
- [ ] Backend `.env` file created with correct MONGODB_URI
- [ ] Frontend `.env` file created with correct API URL
- [ ] All dependencies installed (`npm install` in both folders)
- [ ] No port conflicts (3000 for backend, 3001+ for frontend)

## Getting Help

If you encounter issues:

1. Check MongoDB logs: `C:\Program Files\MongoDB\Server\<version>\log\mongod.log`
2. Check Node.js console output
3. Verify MongoDB replica set status: `rs.status()` in mongosh
4. Ensure all services are running

## Next Steps

Once everything is running:
1. Backend API: http://localhost:3000/api-docs (Swagger)
2. Frontend: http://localhost:3000 (or next available port)
3. Test the API using Postman collection: `backend/postman_collection.json`

