import React from 'react';
import { AppointmentSlot } from '../types';
import './SlotsList.css';

interface SlotsListProps {
  slots: AppointmentSlot[];
}

const SlotsList: React.FC<SlotsListProps> = ({ slots }) => {
  if (slots.length === 0) {
    return (
      <div className="empty-state">
        <p>No appointment slots created yet.</p>
        <p>Create a new slot using the "Create Slot" tab.</p>
      </div>
    );
  }

  return (
    <div className="slots-list">
      <table>
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Specialization</th>
            <th>Start Time</th>
            <th>Total Seats</th>
            <th>Available</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => {
            const startTime = new Date(slot.start_time);
            const formattedDate = startTime.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = startTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const isAvailable = slot.available_seats > 0;
            const isPast = startTime <= new Date();

            return (
              <tr key={slot.id} className={isPast ? 'past' : ''}>
                <td>{slot.doctor_name}</td>
                <td>{slot.specialization || '-'}</td>
                <td>
                  <div className="time-cell">
                    <span className="date">{formattedDate}</span>
                    <span className="time">{formattedTime}</span>
                  </div>
                </td>
                <td>{slot.total_seats}</td>
                <td>{slot.available_seats}</td>
                <td>
                  <span className={`status-badge ${isAvailable ? 'available' : 'full'}`}>
                    {isPast ? 'Past' : isAvailable ? 'Available' : 'Full'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SlotsList;

