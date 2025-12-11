import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import SlotCard from '../components/SlotCard';
import './UserDashboard.css';

const UserDashboard: React.FC = () => {
  const { slots, isLoading, error, fetchSlots } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleBookClick = (slotId: string) => {
    navigate(`/booking/${slotId}`);
  };

  if (isLoading && slots.length === 0) {
    return (
      <div className="user-dashboard">
        <h1>Available Appointment Slots</h1>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <h1>Available Appointment Slots</h1>
      <ErrorAlert />
      
      {slots.length === 0 ? (
        <div className="empty-state">
          <p>No available appointment slots at the moment.</p>
          <p>Please check back later or contact the admin.</p>
        </div>
      ) : (
        <div className="slots-grid">
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onBookClick={() => handleBookClick(slot.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

