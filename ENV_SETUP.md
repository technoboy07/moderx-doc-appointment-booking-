# Environment Variables Setup

## Backend Environment Variables

Create a file `backend/.env` with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/doctor_appointments?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters

# Frontend URL (Update after frontend deployment)
FRONTEND_URL=https://your-frontend.vercel.app
```

### For Local Development:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/doctor_appointments
JWT_SECRET=your-secret-key-change-in-production
```

## Frontend Environment Variables

Create a file `frontend/.env` with the following content:

```env
# Backend API URL (Update this to your deployed backend URL)
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### For Local Development:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

## Generating JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

## Important Notes

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use different secrets for development and production**
3. **Keep your MongoDB credentials secure**
4. **Update `FRONTEND_URL` after deploying frontend**
5. **Update `REACT_APP_API_URL` after deploying backend**

## Setting Environment Variables on Hosting Platforms

### Render.com (Backend)
1. Go to your service → Environment tab
2. Add each variable:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT=10000`
   - `FRONTEND_URL` (add after frontend deploy)

### Vercel (Frontend)
1. Go to Project → Settings → Environment Variables
2. Add:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`

### Netlify (Frontend Alternative)
1. Go to Site → Build & deploy → Environment
2. Add:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`

