# PostgreSQL Setup Guide

Complete guide for setting up PostgreSQL for the Doctor Appointment Booking System.

## 📋 Table of Contents

- [Installation](#installation)
- [Database Setup](#database-setup)
- [Connection Configuration](#connection-configuration)
- [Schema Initialization](#schema-initialization)
- [Troubleshooting](#troubleshooting)
- [Cloud Options](#cloud-options)

---

## 🚀 Installation

### Windows

#### Option 1: Installer (Recommended)

1. Download PostgreSQL from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer
3. During installation:
   - Choose installation directory (default is fine)
   - **Set a password for the `postgres` superuser** (remember this!)
   - Port: `5432` (default)
   - Locale: `Default locale`
4. Complete the installation
5. PostgreSQL service will start automatically

#### Option 2: Using Chocolatey

```powershell
choco install postgresql
```

#### Verify Installation

Open PowerShell and run:

```powershell
psql --version
```

You should see: `psql (PostgreSQL) 15.x` or similar.

### macOS

#### Option 1: Homebrew (Recommended)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

#### Option 2: Postgres.app

1. Download from [postgresapp.com](https://postgresapp.com/)
2. Install and launch the app
3. Click "Initialize" to create a new server

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### Linux (CentOS/RHEL/Fedora)

```bash
# Install PostgreSQL
sudo dnf install postgresql-server postgresql-contrib

# Initialize database
sudo postgresql-setup --initdb

# Start PostgreSQL service
sudo systemctl start postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql

# Verify installation
psql --version
```

---

## 🗄️ Database Setup

### Step 1: Access PostgreSQL

#### Windows

Open **Command Prompt** or **PowerShell**:

```powershell
# Connect as postgres user
psql -U postgres
```

Enter the password you set during installation.

#### macOS/Linux

```bash
# Switch to postgres user
sudo -u postgres psql

# Or connect directly
psql -U postgres
```

### Step 2: Create Database

Once connected to PostgreSQL, run:

```sql
-- Create database
CREATE DATABASE doctor_appointments;

-- Verify database was created
\l
```

You should see `doctor_appointments` in the list.

### Step 3: Create Application User (Optional but Recommended)

For production, create a dedicated user instead of using `postgres`:

```sql
-- Create user
CREATE USER app_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE doctor_appointments TO app_user;

-- Connect to the database
\c doctor_appointments

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
```

### Step 4: Exit PostgreSQL

```sql
\q
```

---

## 🔌 Connection Configuration

### Connection String Format

```
postgresql://username:password@host:port/database
```

### Examples

#### Local Development (Default postgres user)

```
postgresql://postgres:your_password@localhost:5432/doctor_appointments
```

#### Local Development (Custom user)

```
postgresql://app_user:your_password@localhost:5432/doctor_appointments
```

#### Remote Server

```
postgresql://username:password@192.168.1.100:5432/doctor_appointments
```

### Environment Variables

Create `backend/.env` file:

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/doctor_appointments
POSTGRESQL_URI=postgresql://postgres:your_password@localhost:5432/doctor_appointments

# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

**Important**: Replace `your_password` with your actual PostgreSQL password!

---

## 📐 Schema Initialization

The schema will be automatically created when you start the backend server. However, you can also initialize it manually:

### Option 1: Automatic (Recommended)

Just start your backend server:

```bash
cd backend
npm install
npm start
```

The server will automatically run `schema.sql` on first connection.

### Option 2: Manual Initialization

```bash
# Using psql command line
psql -U postgres -d doctor_appointments -f backend/src/database/schema.sql

# Or connect first, then run
psql -U postgres -d doctor_appointments
\i backend/src/database/schema.sql
```

### Verify Schema

```sql
-- Connect to database
psql -U postgres -d doctor_appointments

-- List all tables
\dt

-- Describe a table
\d doctors
\d appointment_slots
\d bookings

-- Check indexes
\di
```

You should see:
- `doctors` table
- `appointment_slots` table
- `bookings` table
- Various indexes

---

## 🔧 Common Operations

### Start PostgreSQL Service

**Windows:**
```powershell
# Start service
net start postgresql-x64-15

# Or via Services GUI
# Search "Services" → Find "postgresql-x64-15" → Start
```

**macOS:**
```bash
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### Stop PostgreSQL Service

**Windows:**
```powershell
net stop postgresql-x64-15
```

**macOS:**
```bash
brew services stop postgresql@15
```

**Linux:**
```bash
sudo systemctl stop postgresql
```

### Check PostgreSQL Status

**Windows:**
```powershell
# Check if service is running
Get-Service postgresql*
```

**macOS/Linux:**
```bash
sudo systemctl status postgresql
```

### Reset Database (Development Only)

⚠️ **Warning**: This will delete all data!

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Drop and recreate database
DROP DATABASE IF EXISTS doctor_appointments;
CREATE DATABASE doctor_appointments;

-- Exit
\q

-- Reinitialize schema
psql -U postgres -d doctor_appointments -f backend/src/database/schema.sql
```

### Backup Database

```bash
# Create backup
pg_dump -U postgres doctor_appointments > backup.sql

# Restore from backup
psql -U postgres doctor_appointments < backup.sql
```

---

## 🐛 Troubleshooting

### Issue: "psql: command not found"

**Solution:**
- **Windows**: Add PostgreSQL bin directory to PATH:
  - Default: `C:\Program Files\PostgreSQL\15\bin`
  - Add to System Environment Variables → Path
- **macOS/Linux**: Ensure PostgreSQL is installed and in PATH

### Issue: "password authentication failed"

**Solution:**
1. Check if you're using the correct password
2. Reset password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_password';
   ```
3. Update `.env` file with new password

### Issue: "database does not exist"

**Solution:**
```sql
-- Create the database
CREATE DATABASE doctor_appointments;
```

### Issue: "connection refused"

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. Check PostgreSQL is listening on port 5432:
   ```bash
   # Windows
   netstat -an | findstr 5432
   
   # macOS/Linux
   sudo netstat -tulpn | grep 5432
   ```

3. Check `pg_hba.conf` file (usually in PostgreSQL data directory):
   ```
   # Allow local connections
   host    all             all             127.0.0.1/32            md5
   host    all             all             ::1/128                 md5
   ```

### Issue: "permission denied"

**Solution:**
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE doctor_appointments TO your_user;
GRANT ALL ON SCHEMA public TO your_user;
```

### Issue: "relation already exists" (when running schema.sql)

**Solution:**
This is normal if tables already exist. The schema uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Issue: Port 5432 already in use

**Solution:**
1. Find what's using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5432
   
   # macOS/Linux
   sudo lsof -i :5432
   ```

2. Either:
   - Stop the conflicting service
   - Change PostgreSQL port in `postgresql.conf`:
     ```
     port = 5433
     ```

---

## ☁️ Cloud Options

### Render PostgreSQL (Recommended for Deployment)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `doctor-appointment-db`
   - **Database**: `doctor_appointments`
   - **User**: Auto-generated
   - **Region**: Choose closest to your backend
4. Click **Create Database**
5. Copy the **Internal Database URL** or **External Database URL**
6. Use in your `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/doctor_appointments
   ```

### Railway PostgreSQL

1. Go to [Railway](https://railway.app)
2. Click **New Project** → **Provision PostgreSQL**
3. Database is created automatically
4. Copy `DATABASE_URL` from Variables tab

### Supabase (Free Tier Available)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (URI format)
5. Use in your `.env`

### AWS RDS PostgreSQL

1. Go to AWS RDS Console
2. Create PostgreSQL instance
3. Configure security groups to allow your IP
4. Copy endpoint and use in connection string

### Heroku Postgres

1. Go to Heroku Dashboard
2. Add Postgres addon to your app
3. Copy `DATABASE_URL` from config vars

---

## 📚 Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [pg Node.js Client Documentation](https://node-postgres.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---

## ✅ Quick Checklist

- [ ] PostgreSQL installed
- [ ] PostgreSQL service running
- [ ] Database `doctor_appointments` created
- [ ] User created (optional)
- [ ] Connection string configured in `.env`
- [ ] Schema initialized (automatic on server start)
- [ ] Can connect using `psql`
- [ ] Backend can connect successfully

---

## 🎯 Next Steps

After completing PostgreSQL setup:

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```

3. **Start the backend server:**
   ```bash
   npm run dev
   ```

4. **Verify connection:**
   - Check console for: `✅ PostgreSQL Connected`
   - Check console for: `✅ Database schema initialized`

5. **Test API:**
   - Visit: `http://localhost:3000/api-docs`
   - Try creating a doctor via Swagger UI

---

**Need Help?** Check the main [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md) for more information.

