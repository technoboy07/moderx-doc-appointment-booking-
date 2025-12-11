import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Doctor, AppointmentSlot, Booking } from '../types';
import { doctorApi, slotApi, bookingApi } from '../services/api';

interface AppContextType {
  // State
  doctors: Doctor[];
  slots: AppointmentSlot[];
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDoctors: () => Promise<void>;
  fetchSlots: () => Promise<void>;
  createDoctor: (name: string, specialization?: string) => Promise<void>;
  createSlot: (doctorId: string, startTime: string, totalSeats?: number) => Promise<void>;
  bookAppointment: (slotId: string, userName: string, userEmail: string, seatsBooked?: number) => Promise<Booking>;
  fetchMyBookings: () => Promise<void>;
  fetchAllBookings: () => Promise<void>;
  clearError: () => void;
  cancelBooking: (bookingId: string) => Promise<void>;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await doctorApi.getAll();
      setDoctors(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await slotApi.getAll();
      setSlots(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch slots');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDoctor = useCallback(async (name: string, specialization?: string) => {
    try {
      setIsLoading(true);
      const newDoctor = await doctorApi.create(name, specialization);
      setDoctors((prev) => [newDoctor, ...prev]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create doctor');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSlot = useCallback(async (doctorId: string, startTime: string, totalSeats?: number) => {
    try {
      setIsLoading(true);
      const newSlot = await slotApi.create(doctorId, startTime, totalSeats);
      setSlots((prev) => [newSlot, ...prev]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create slot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bookingApi.getMyBookings();
      setBookings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bookingApi.getAll();
      setBookings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bookAppointment = useCallback(async (
    slotId: string,
    userName: string,
    userEmail: string,
    seatsBooked?: number
  ): Promise<Booking> => {
    try {
      setIsLoading(true);
      const booking = await bookingApi.create(slotId, userName, userEmail, seatsBooked);
      setBookings((prev) => [booking, ...prev]);
      
      // Update slot availability in local state
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? { ...slot, available_seats: slot.available_seats - (seatsBooked || 1) }
            : slot
        )
      );
      
      // Add booking to local state
      setBookings((prev) => [booking, ...prev]);
      
      setError(null);
      return booking;
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      setIsLoading(true);
      await bookingApi.cancel(bookingId);
      
      // Remove booking from local state
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      
      // Refresh slots to update availability
      await fetchSlots();
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSlots]);

  // Fetch initial data
  useEffect(() => {
    fetchDoctors();
    fetchSlots();
  }, [fetchDoctors, fetchSlots]);

  // Refresh slots periodically (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSlots();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSlots]);

  const value: AppContextType = {
    doctors,
    slots,
    bookings,
    isLoading,
    error,
    userEmail,
    fetchDoctors,
    fetchSlots,
    createDoctor,
    createSlot,
    bookAppointment,
    fetchMyBookings,
    fetchAllBookings,
    cancelBooking,
    setUserEmail,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

