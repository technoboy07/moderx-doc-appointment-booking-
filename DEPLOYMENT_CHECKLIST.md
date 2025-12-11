# Deployment Checklist

## Pre-Deployment
- [ ] Code committed to GitHub
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] README updated with deployment info
- [ ] No console errors in development
- [ ] All TypeScript errors resolved

## Database Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for development)
- [ ] Connection string obtained and tested
- [ ] Database name: `doctor_appointments`
- [ ] Connection string includes replica set parameters
- [ ] Database seeded (optional but recommended)

## Backend Deployment
- [ ] Render/Railway account created
- [ ] GitHub repository connected
- [ ] New Web Service created
- [ ] Build command set: `npm install`
- [ ] Start command set: `npm start`
- [ ] Root directory set: `backend` (if monorepo)
- [ ] Environment variables set:
  - [ ] MONGODB_URI (from Atlas)
  - [ ] JWT_SECRET (strong random string)
  - [ ] NODE_ENV=production
  - [ ] PORT=10000 (for Render)
  - [ ] FRONTEND_URL (will add after frontend deploy)
- [ ] CORS configured in server.js
- [ ] Deployment successful
- [ ] Health endpoint tested: `/health`
- [ ] Swagger docs accessible: `/api-docs`
- [ ] API endpoints tested with Postman/browser
- [ ] No errors in deployment logs

## Frontend Deployment
- [ ] Vercel/Netlify account created
- [ ] GitHub repository connected
- [ ] New project created
- [ ] Framework preset: Create React App
- [ ] Root directory set: `frontend` (if monorepo)
- [ ] Build command: `npm run build`
- [ ] Output directory: `build`
- [ ] Environment variable set:
  - [ ] REACT_APP_API_URL=https://your-backend.onrender.com/api
- [ ] Deployment successful
- [ ] Frontend loads correctly
- [ ] No build errors

## Backend CORS Update
- [ ] Frontend URL obtained
- [ ] FRONTEND_URL added to backend environment variables
- [ ] Backend redeployed (if needed)
- [ ] CORS errors resolved

## Testing
- [ ] Frontend can access backend APIs
- [ ] Login works (admin and user)
- [ ] Admin features work:
  - [ ] Create doctors
  - [ ] Create slots
  - [ ] View all bookings
- [ ] User features work:
  - [ ] View available slots
  - [ ] Book appointments
  - [ ] View my bookings
  - [ ] Cancel appointments
- [ ] No console errors in browser
- [ ] No CORS errors
- [ ] Network tab shows successful API calls
- [ ] Mobile responsive (test on mobile or resize browser)
- [ ] Error handling works (test invalid inputs)

## Documentation
- [ ] GitHub README updated with:
  - [ ] Deployment instructions
  - [ ] Environment variables
  - [ ] Live URLs
- [ ] DEPLOYMENT.md created
- [ ] VIDEO_SCRIPT.md created
- [ ] DEPLOYMENT_CHECKLIST.md created
- [ ] All URLs documented

## Video Preparation
- [ ] Video script reviewed
- [ ] Screen recording software ready
- [ ] Microphone tested
- [ ] Deployment steps practiced
- [ ] Feature demo practiced
- [ ] All URLs ready to show

## Submission
- [ ] Frontend URL ready and working
- [ ] Backend URL ready and working
- [ ] GitHub repo public and accessible
- [ ] Video recorded and uploaded (YouTube unlisted or Google Drive)
- [ ] All links documented:
  - [ ] Frontend URL
  - [ ] Backend URL
  - [ ] GitHub Repository
  - [ ] Video Link
- [ ] Final submission prepared

## Post-Deployment Monitoring
- [ ] Monitor backend logs for errors
- [ ] Monitor frontend for user issues
- [ ] Check database connection stability
- [ ] Verify cron jobs running (booking expiry)
- [ ] Test all features periodically

## Quick Test Commands

### Test Backend Health
```bash
curl https://your-backend.onrender.com/health
```

### Test Backend API
```bash
curl https://your-backend.onrender.com/api/doctors
```

### Test Frontend
Visit: https://your-frontend.vercel.app

### Test Login
- Admin: admin@doctorapp.com / admin123
- User: user@doctorapp.com / user123

