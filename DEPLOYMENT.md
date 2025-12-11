# Deployment Guide - Doctor Appointment Booking System

## 📋 Prerequisites

- GitHub account
- PostgreSQL database (Render PostgreSQL, Railway PostgreSQL, Supabase, or local PostgreSQL)
- Render.com account (for backend) OR Railway/AWS
- Vercel account (for frontend) OR Netlify

## 🗄️ Step 1: Database Setup (PostgreSQL)

### Option A: Render PostgreSQL (Recommended - Free Tier Available)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `doctor-appointment-db`
   - **Database**: `doctor_appointments`
   - **User**: Auto-generated
   - **Region**: Choose closest to your backend
4. Click **Create Database**
5. Wait for database to be created (~2-3 minutes)
6. Copy the **Internal Database URL** (for Render services) or **External Database URL** (for external access)
7. Format: `postgresql://user:password@host:5432/database_name`

### Option B: Railway PostgreSQL

1. Go to [Railway](https://railway.app)
2. Click **New Project** → **Provision PostgreSQL**
3. Database will be created automatically
4. Copy the `DATABASE_URL` from the Variables tab

### Option C: Supabase (Free Tier Available)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (URI format)

### Option D: Local PostgreSQL

1. Install PostgreSQL locally
2. Create database: `createdb doctor_appointments`
3. Connection string: `postgresql://postgres:password@localhost:5432/doctor_appointments`

### 1.1 Initialize Database Schema

The schema will be automatically created when the backend starts. Alternatively, you can run:

```bash
psql -d doctor_appointments -f backend/src/database/schema.sql
```

Or the backend will automatically run the schema.sql file on first connection.

## 🚀 Step 2: Backend Deployment (Render.com)

### 2.1 Prepare Backend Repository

1. Ensure all code is committed to GitHub
2. Create `.env.example` file (already provided)
3. Push to GitHub

### 2.2 Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the repository
5. Configure:
   - **Name**: `doctor-appointment-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (if repo is monorepo)

### 2.3 Set Environment Variables in Render

Go to **Environment** tab and add:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/doctor_appointments
POSTGRESQL_URI=postgresql://user:password@host:5432/doctor_appointments
JWT_SECRET=generate-a-random-strong-secret-key-here-minimum-32-characters
FRONTEND_URL=https://your-frontend.vercel.app
```

**Note**: If using Render PostgreSQL service, `DATABASE_URL` is automatically set. Otherwise, provide your PostgreSQL connection string.

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy

1. Click **Create Web Service**
2. Wait for deployment (~5-10 minutes)
3. Copy the service URL (e.g., `https://doctor-appointment-backend.onrender.com`)

### 2.5 Test Backend API

1. Visit: `https://your-backend-url.onrender.com/health`
2. Should return: `{"status":"ok","timestamp":"..."}`
3. Visit: `https://your-backend-url.onrender.com/api-docs`
4. Should show Swagger documentation

### 2.6 Seed Database (Optional)

You can seed the database by:
1. Running the seed script locally: `npm run seed` (with DATABASE_URL set)
2. Or connecting via psql and inserting data manually
3. Or using pgAdmin to add data

## 🎨 Step 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend Repository

1. Ensure all code is committed
2. Create `.env.example` file
3. Push to GitHub

### 3.2 Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend` (if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3.3 Set Environment Variables in Vercel

Go to **Settings** → **Environment Variables**:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

### 3.4 Deploy

1. Click **Deploy**
2. Wait for build (~2-5 minutes)
3. Copy the deployment URL (e.g., `https://doctor-appointments.vercel.app`)

### 3.5 Update Backend CORS

After getting your frontend URL, update the backend CORS configuration:

1. Go to Render dashboard → Your backend service → Environment
2. Add/Update: `FRONTEND_URL=https://your-frontend.vercel.app`
3. Redeploy backend

### 3.6 Test Frontend

1. Visit deployed URL
2. Test login functionality
3. Test booking flow
4. Check browser console for any errors

## 🔗 Step 4: Connect Frontend & Backend

### 4.1 Verify API Calls

1. Open browser DevTools → Network tab
2. Perform actions in frontend
3. Verify API calls are going to correct backend URL
4. Check for CORS errors

### 4.2 Test Complete Flow

1. Login as admin
2. Create a doctor
3. Create appointment slots
4. Login as user
5. Book an appointment
6. View bookings
7. Cancel booking

## ✅ Step 5: Final Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and working
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] API endpoints responding
- [ ] Frontend can communicate with backend
- [ ] Authentication working
- [ ] All features functional
- [ ] No console errors

## 🎥 Video Submission Checklist

### Part A: Deployment Explanation

- [ ] Show project folder structure
- [ ] Explain dependencies (package.json)
- [ ] Show installation steps
- [ ] Explain environment variables (what each does)
- [ ] Show how to set env vars on hosting platform
- [ ] Show backend deployment process
- [ ] Show build/start commands
- [ ] Test backend APIs (Postman/browser)
- [ ] Show frontend deployment process
- [ ] Show build process
- [ ] Show environment variable configuration
- [ ] Show API URL update
- [ ] Demonstrate frontend-backend connection
- [ ] Show Network tab with API calls
- [ ] Show all features working
- [ ] Display final URLs

### Part B: Product Explanation

- [ ] Explain product objective
- [ ] Explain target users
- [ ] Show tech stack
- [ ] Explain architecture
- [ ] Explain why you chose this stack
- [ ] Demo all features:
  - [ ] User login
  - [ ] Admin dashboard
  - [ ] Create doctors
  - [ ] Create slots
  - [ ] View available slots
  - [ ] Book appointments
  - [ ] Cancel appointments
  - [ ] View bookings
- [ ] Explain innovations:
  - [ ] Concurrency control
  - [ ] Transaction handling
  - [ ] Atomic operations
  - [ ] Booking expiry system
  - [ ] UI/UX improvements
- [ ] Show testing approach
- [ ] Explain challenges and solutions

## 🔗 Final Submission Links

- **Frontend URL**: `https://your-frontend.vercel.app`
- **Backend URL**: `https://your-backend.onrender.com`
- **GitHub Repository**: `https://github.com/yourusername/your-repo`
- **Video Link**: `https://youtube.com/watch?v=...` (unlisted)

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- Check environment variables
- Check build logs
- Verify MongoDB connection string

**Problem**: CORS errors
- Update CORS origin list in server.js
- Check FRONTEND_URL environment variable
- Check backend logs

**Problem**: Database connection failed
- Verify PostgreSQL is running and accessible
- Check connection string format: `postgresql://user:password@host:port/database`
- Verify database user credentials
- Check if SSL is required (add `?ssl=true` to connection string for cloud providers)

### Frontend Issues

**Problem**: API calls failing
- Check `REACT_APP_API_URL` environment variable
- Verify backend is accessible
- Check CORS configuration
- Check browser console for errors

**Problem**: Build failing
- Check Node version compatibility
- Verify all dependencies installed
- Check build logs for specific errors

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

