import React from 'react';
import { useApp } from '../context/AppContext';
import './ErrorAlert.css';

const ErrorAlert: React.FC = () => {
  const { error, clearError } = useApp();

  if (!error) return null;

  return (
    <div className="error-alert">
      <span className="error-message">⚠️ {error}</span>
      <button className="error-close" onClick={clearError}>
        ×
      </button>
    </div>
  );
};

export default ErrorAlert;

