import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingCard from '../components/BookingCard';
import './UserBookings.css';

const UserBookings: React.FC = () => {
  const { bookings, isLoading, error, fetchMyBookings, cancelBooking } = useApp();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch bookings for logged-in user
    if (isAuthenticated && user) {
      fetchMyBookings();
    }
  }, [isAuthenticated, user, authLoading, fetchMyBookings, navigate]);

  if (authLoading) {
    return (
      <div className="user-bookings">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="user-bookings">
      <h1>My Booked Appointments</h1>
      {user && (
        <p className="user-info">Viewing bookings for: <strong>{user.email}</strong></p>
      )}
      <ErrorAlert />

      {isLoading && bookings.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any bookings yet.</p>
              <p>Browse available slots and book an appointment to get started!</p>
            </div>
          ) : (
            <>
              <div className="bookings-grid">
               {bookings.map((booking) => (
               <BookingCard 
                 key={booking.id} 
                  booking={booking}
      onCancel={cancelBooking}
    />
  ))}
</div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserBookings;
