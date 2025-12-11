import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './CreateDoctorForm.css';

interface CreateDoctorFormProps {
  onSuccess: () => void;
}

const CreateDoctorForm: React.FC<CreateDoctorFormProps> = ({ onSuccess }) => {
  const { createDoctor, isLoading } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Doctor name is required');
      return;
    }

    try {
      await createDoctor(
        formData.name.trim(),
        formData.specialization.trim() || undefined
      );
      setFormData({ name: '', specialization: '' });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create doctor');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="create-doctor-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Doctor Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="e.g., Dr. John Smith"
        />
      </div>

      <div className="form-group">
        <label htmlFor="specialization">Specialization</label>
        <input
          type="text"
          id="specialization"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., Cardiology"
        />
      </div>

      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Doctor'}
      </button>
    </form>
  );
};

export default CreateDoctorForm;

