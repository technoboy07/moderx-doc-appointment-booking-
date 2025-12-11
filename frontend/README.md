# Doctor Appointment Booking System - Frontend

A modern, responsive React + TypeScript frontend application for managing doctor appointments.

## Features

- ✅ **Admin Dashboard**: Create doctors and appointment slots
- ✅ **User Dashboard**: Browse and book available appointments
- ✅ **Real-time Updates**: Automatic slot availability refresh
- ✅ **Seat Selection**: Visual seat selection with DOM manipulation
- ✅ **Error Handling**: Comprehensive error handling and validation
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **TypeScript**: Full type safety throughout the application

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **CSS3** - Styling

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure API URL

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

If your backend is running on a different port or URL, update this accordingly.

### 3. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000` (or the next available port).

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── ErrorAlert.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── SlotCard.tsx
│   │   ├── CreateDoctorForm.tsx
│   │   ├── CreateSlotForm.tsx
│   │   └── SlotsList.tsx
│   ├── context/          # Context API for state management
│   │   └── AppContext.tsx
│   ├── pages/            # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── UserDashboard.tsx
│   │   └── BookingPage.tsx
│   ├── services/         # API service layer
│   │   └── api.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx           # Main app component
│   ├── App.css
│   ├── index.tsx         # Entry point
│   └── index.css         # Global styles
├── package.json
└── tsconfig.json
```

## Routes

- `/` - User dashboard (list available slots)
- `/admin` - Admin dashboard (create doctors and slots)
- `/booking/:id` - Booking page for a specific slot

## Key Features Explained

### State Management (Context API)

The `AppContext` provides global state for:
- Doctors list
- Appointment slots
- Bookings
- Loading states
- Error handling
- Admin mode toggle

### API Integration

All API calls are centralized in `services/api.ts`:
- Automatic error handling via interceptors
- Type-safe responses
- Consistent error format

### Seat Selection

The booking page implements direct DOM manipulation:
- Seats are highlighted on click using `refs`
- Selected seats are tracked in state
- Cleanup on component unmount prevents memory leaks

### Error Handling

- Form validation (client-side)
- API error handling (network, server errors)
- User-friendly error messages
- Error alerts with dismiss functionality

### Real-time Updates

- Slots are automatically refreshed every 30 seconds
- Manual refresh available via context methods
- Optimistic updates for better UX

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Deployment

### Option 1: Static Hosting (Netlify, Vercel)

1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables

### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Assumptions

1. **Authentication**: Mock authentication is used (admin toggle button). In production, implement proper authentication.
2. **API URL**: Backend API is accessible at the configured URL.
3. **Browser Support**: Modern browsers with ES6+ support.
4. **Seat Booking**: For doctor appointments, typically only 1 seat is booked per slot, but the system supports multiple seats.

## Known Limitations

1. No real authentication system (mock admin toggle)
2. No payment integration
3. No email/SMS notifications
4. No booking history page
5. No user profile management

## Future Enhancements

- [ ] Real authentication system (JWT, OAuth)
- [ ] User profiles and booking history
- [ ] Email/SMS notifications
- [ ] Payment integration
- [ ] Calendar view for slots
- [ ] Search and filter functionality
- [ ] WebSocket for real-time updates
- [ ] Progressive Web App (PWA) support

## Screenshots

The application includes:
- Clean, modern UI
- Responsive design for mobile and desktop
- Intuitive navigation
- Clear error messages
- Loading states

## Troubleshooting

### API Connection Issues

- Ensure backend is running
- Check `REACT_APP_API_URL` in `.env`
- Verify CORS is enabled on backend

### Build Issues

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf build`

### TypeScript Errors

- Ensure all dependencies are installed
- Check `tsconfig.json` configuration
- Verify type definitions are correct

