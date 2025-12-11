import React from 'react';
import { Booking } from '../types';
import BookingCard from './BookingCard';
import './AdminBookingsList.css';

interface AdminBookingsListProps {
  bookings: Booking[];
}

const AdminBookingsList: React.FC<AdminBookingsListProps> = ({ bookings }) => {
  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <p>No bookings found.</p>
      </div>
    );
  }

  // Group bookings by status
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const failedBookings = bookings.filter(b => b.status === 'FAILED');

  return (
    <div className="admin-bookings-list">
      <div className="bookings-stats">
        <div className="stat-card confirmed">
          <h3>{confirmedBookings.length}</h3>
          <p>Confirmed</p>
        </div>
        <div className="stat-card pending">
          <h3>{pendingBookings.length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card failed">
          <h3>{failedBookings.length}</h3>
          <p>Failed</p>
        </div>
        <div className="stat-card total">
          <h3>{bookings.length}</h3>
          <p>Total</p>
        </div>
      </div>

      <div className="bookings-section">
        <h2>All Bookings ({bookings.length})</h2>
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsList;

