import React, { useState } from 'react';
import { Booking } from '../types';
import './BookingCard.css';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  
  const startTime = booking.start_time ? new Date(booking.start_time) : null;
  const formattedDate = startTime
    ? startTime.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';
  const formattedTime = startTime
    ? startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'confirmed';
      case 'PENDING':
        return 'pending';
      case 'FAILED':
        return 'failed';
      default:
        return '';
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setIsCancelling(true);
      try {
        await onCancel(booking.id);
      } catch (error) {
        // Error is handled by AppContext
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <div className={`booking-card ${getStatusBadgeClass(booking.status)}`}>
      <div className="booking-header">
        <h3>{booking.doctor_name || 'Unknown Doctor'}</h3>
        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
          {booking.status}
        </span>
      </div>
      <div className="booking-details">
        <div className="booking-info">
          <p><strong>Date:</strong> {formattedDate}</p>
          <p><strong>Time:</strong> {formattedTime}</p>
          <p><strong>Seats:</strong> {booking.seats_booked}</p>
        </div>
        <div className="booking-user">
          <p><strong>Booked by:</strong> {booking.user_name}</p>
          <p><strong>Email:</strong> {booking.user_email}</p>
        </div>
      </div>
      <div className="booking-footer">
        <span className="booking-id">Booking ID: {booking.id.slice(-8)}</span>
        {booking.created_at && (
          <span className="booking-date">
            Booked: {new Date(booking.created_at).toLocaleDateString()}
          </span>
        )}
      </div>
      {onCancel && booking.status !== 'FAILED' && (
        <div className="booking-actions">
          <button
            className="cancel-booking-button"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;