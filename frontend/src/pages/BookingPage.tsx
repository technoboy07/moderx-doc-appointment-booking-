import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { slotApi } from '../services/api';
import { AppointmentSlot } from '../types';
import './BookingPage.css';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookAppointment, isLoading, setUserEmail } = useApp();
  const [slot, setSlot] = useState<AppointmentSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
  });
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const seatRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchSlot = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const slotData = await slotApi.getById(id);
        setSlot(slotData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load slot details');
      } finally {
        setLoading(false);
      }
    };

    fetchSlot();
  }, [id]);

  const handleSeatClick = (seatNumber: number) => {
    if (!slot || seatNumber > slot.available_seats) return;

    setSelectedSeats((prev) => {
      const newSelection = [...prev];
      const index = newSelection.indexOf(seatNumber);
      
      if (index > -1) {
        newSelection.splice(index, 1);
        // Remove highlight from DOM
        const seatElement = seatRefs.current[seatNumber];
        if (seatElement) {
          seatElement.classList.remove('selected');
        }
      } else {
        newSelection.push(seatNumber);
        // Add highlight to DOM
        const seatElement = seatRefs.current[seatNumber];
        if (seatElement) {
          seatElement.classList.add('selected');
        }
      }
      
      return newSelection;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slot) return;
    
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    if (!formData.userName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.userEmail.trim()) {
      setError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setError(null);
      await bookAppointment(
        slot.id,
        formData.userName,
        formData.userEmail,
        selectedSeats.length
      );
      
      // Note: User email is now managed through auth context
      
      setBookingStatus('success');
      
      // Cleanup: Remove highlights
      selectedSeats.forEach((seatNum) => {
        const seatElement = seatRefs.current[seatNum];
        if (seatElement) {
          seatElement.classList.remove('selected');
        }
      });
      
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
      setBookingStatus('error');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(seatRefs.current).forEach((element) => {
        if (element) {
          element.classList.remove('selected');
        }
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="booking-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="booking-page">
        <div className="error-state">
          <p>Slot not found</p>
          <button onClick={() => navigate('/')}>Go Back</button>
        </div>
      </div>
    );
  }

  const startTime = new Date(slot.start_time);
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="booking-page">
      <h1>Book Appointment</h1>
      
      <div className="booking-container">
        <div className="slot-info">
          <h2>{slot.doctor_name}</h2>
          {slot.specialization && (
            <p className="specialization">{slot.specialization}</p>
          )}
          <div className="time-info">
            <p><strong>Date:</strong> {formattedDate}</p>
            <p><strong>Time:</strong> {formattedTime}</p>
            <p><strong>Available:</strong> {slot.available_seats} seat(s)</p>
          </div>
        </div>

        {slot.available_seats > 0 ? (
          <>
            <div className="seat-selection">
              <h3>Select Seats ({selectedSeats.length} selected)</h3>
              <div className="seats-grid">
                {Array.from({ length: slot.available_seats }, (_, i) => i + 1).map(
                  (seatNum) => (
                    <div
                      key={seatNum}
                      ref={(el) => {
                        seatRefs.current[seatNum] = el;
                      }}
                      className={`seat ${selectedSeats.includes(seatNum) ? 'selected' : ''}`}
                      onClick={() => handleSeatClick(seatNum)}
                    >
                      {seatNum}
                    </div>
                  )
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              <ErrorAlert />
              {error && <div className="form-error">⚠️ {error}</div>}
              
              {bookingStatus === 'success' && (
                <div className="success-message">
                  ✅ Appointment booked successfully! Redirecting...
                </div>
              )}

              <div className="form-group">
                <label htmlFor="userName">Your Name *</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || bookingStatus === 'success'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="userEmail">Your Email *</label>
                <input
                  type="email"
                  id="userEmail"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || bookingStatus === 'success'}
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || bookingStatus === 'success' || selectedSeats.length === 0}
              >
                {isLoading ? 'Booking...' : `Book ${selectedSeats.length} Seat(s)`}
              </button>
            </form>
          </>
        ) : (
          <div className="fully-booked">
            <p>This slot is fully booked.</p>
            <button onClick={() => navigate('/')}>View Other Slots</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;

