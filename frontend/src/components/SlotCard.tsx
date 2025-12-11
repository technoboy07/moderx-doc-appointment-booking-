import React from 'react';
import { AppointmentSlot } from '../types';
import './SlotCard.css';

interface SlotCardProps {
  slot: AppointmentSlot;
  onBookClick: () => void;
}

const SlotCard: React.FC<SlotCardProps> = ({ slot, onBookClick }) => {
  const startTime = new Date(slot.start_time);
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isAvailable = slot.available_seats > 0;

  return (
    <div className={`slot-card ${!isAvailable ? 'unavailable' : ''}`}>
      <div className="slot-header">
        <h3>{slot.doctor_name}</h3>
        {slot.specialization && (
          <span className="specialization">{slot.specialization}</span>
        )}
      </div>
      <div className="slot-details">
        <div className="slot-time">
          <span className="date">{formattedDate}</span>
          <span className="time">{formattedTime}</span>
        </div>
        <div className="slot-availability">
          <span className={`badge ${isAvailable ? 'available' : 'full'}`}>
            {isAvailable
              ? `${slot.available_seats} available`
              : 'Fully booked'}
          </span>
        </div>
      </div>
      {isAvailable && (
        <button className="book-button" onClick={onBookClick}>
          Book Appointment
        </button>
      )}
    </div>
  );
};

export default SlotCard;

