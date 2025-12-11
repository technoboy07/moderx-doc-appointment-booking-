import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import UserBookings from './pages/UserBookings';
import BookingPage from './pages/BookingPage';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<UserDashboard />} />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <UserBookings />
                    </ProtectedRoute>
                  }
                />
                <Route path="/booking/:id" element={<BookingPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;

