import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Doctor } from '../types';
import './CreateSlotForm.css';

interface CreateSlotFormProps {
  doctors: Doctor[];
  onSuccess: () => void;
}

const CreateSlotForm: React.FC<CreateSlotFormProps> = ({ doctors, onSuccess }) => {
  const { createSlot, isLoading } = useApp();
  const [formData, setFormData] = useState({
    doctorId: '',
    startTime: '',
    totalSeats: '1',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.doctorId) {
      setError('Please select a doctor');
      return;
    }

    if (!formData.startTime) {
      setError('Please select a start time');
      return;
    }

    const startDate = new Date(formData.startTime);
    if (startDate <= new Date()) {
      setError('Start time must be in the future');
      return;
    }

    const totalSeats = parseInt(formData.totalSeats);
    if (isNaN(totalSeats) || totalSeats < 1) {
      setError('Total seats must be at least 1');
      return;
    }

    try {
      await createSlot(
        formData.doctorId,
        startDate.toISOString(),
        totalSeats
      );
      setFormData({ doctorId: '', startTime: '', totalSeats: '1' });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create slot');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Get minimum datetime (now)
  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="create-slot-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="doctorId">Doctor *</label>
        <select
          id="doctorId"
          name="doctorId"
          value={formData.doctorId}
          onChange={handleChange}
          required
          disabled={isLoading || doctors.length === 0}
        >
          <option value="">Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
              {doctor.specialization && ` - ${doctor.specialization}`}
            </option>
          ))}
        </select>
        {doctors.length === 0 && (
          <p className="help-text">No doctors available. Please create a doctor first.</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="startTime">Start Time *</label>
        <input
          type="datetime-local"
          id="startTime"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          min={minDateTime}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="totalSeats">Total Seats *</label>
        <input
          type="number"
          id="totalSeats"
          name="totalSeats"
          value={formData.totalSeats}
          onChange={handleChange}
          min="1"
          required
          disabled={isLoading}
        />
        <p className="help-text">Number of available appointment slots</p>
      </div>

      <button type="submit" className="submit-button" disabled={isLoading || doctors.length === 0}>
        {isLoading ? 'Creating...' : 'Create Slot'}
      </button>
    </form>
  );
};

export default CreateSlotForm;

