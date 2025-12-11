import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import CreateDoctorForm from '../components/CreateDoctorForm';
import CreateSlotForm from '../components/CreateSlotForm';
import SlotsList from '../components/SlotsList';
import AdminBookingsList from '../components/AdminBookingsList';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { doctors, slots, bookings, isLoading, fetchDoctors, fetchSlots, fetchAllBookings } = useApp();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'doctors' | 'slots' | 'create-slot' | 'bookings'>('slots');

  // Redirect if not admin (shouldn't happen due to ProtectedRoute, but extra safety)
  useEffect(() => {
    if (!isAdmin) {
      // This is handled by ProtectedRoute, but keeping for safety
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchDoctors();
    fetchSlots();
    if (activeTab === 'bookings') {
      fetchAllBookings();
    }
  }, [fetchDoctors, fetchSlots, fetchAllBookings, activeTab]);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <ErrorAlert />

      <div className="admin-tabs">
        <button
          className={activeTab === 'slots' ? 'active' : ''}
          onClick={() => setActiveTab('slots')}
        >
          View Slots
        </button>
        <button
          className={activeTab === 'create-slot' ? 'active' : ''}
          onClick={() => setActiveTab('create-slot')}
        >
          Create Slot
        </button>
        <button
          className={activeTab === 'doctors' ? 'active' : ''}
          onClick={() => setActiveTab('doctors')}
        >
          Manage Doctors
        </button>
        <button
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => {
            setActiveTab('bookings');
            fetchAllBookings();
          }}
        >
          View Bookings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'slots' && (
          <div>
            <h2>All Appointment Slots</h2>
            {isLoading ? <LoadingSpinner /> : <SlotsList slots={slots} />}
          </div>
        )}

        {activeTab === 'create-slot' && (
          <div>
            <h2>Create New Appointment Slot</h2>
            <CreateSlotForm doctors={doctors} onSuccess={() => fetchSlots()} />
          </div>
        )}

        {activeTab === 'doctors' && (
          <div>
            <h2>Manage Doctors</h2>
            <CreateDoctorForm onSuccess={() => fetchDoctors()} />
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="doctors-list">
                {doctors.length === 0 ? (
                  <p className="empty-message">No doctors yet. Create one above.</p>
                ) : (
                  doctors.map((doctor) => (
                    <div key={doctor.id} className="doctor-card">
                      <h3>{doctor.name}</h3>
                      {doctor.specialization && (
                        <p className="specialization">{doctor.specialization}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h2>All Bookings</h2>
            {isLoading ? <LoadingSpinner /> : <AdminBookingsList bookings={bookings} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

