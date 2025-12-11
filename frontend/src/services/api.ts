import axios from 'axios';
import { Doctor, AppointmentSlot, Booking, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      return Promise.reject({
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
        status: error.response.status,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

// Doctors API
export const doctorApi = {
  getAll: async (): Promise<Doctor[]> => {
    const response = await api.get<ApiResponse<Doctor[]>>('/doctors');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Doctor> => {
    const response = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    if (!response.data.data) throw new Error('Doctor not found');
    return response.data.data;
  },

  create: async (name: string, specialization?: string): Promise<Doctor> => {
    const response = await api.post<ApiResponse<Doctor>>('/doctors', {
      name,
      specialization,
    });
    if (!response.data.data) throw new Error('Failed to create doctor');
    return response.data.data;
  },
};

// Slots API
export const slotApi = {
  getAll: async (): Promise<AppointmentSlot[]> => {
    const response = await api.get<ApiResponse<AppointmentSlot[]>>('/slots');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<AppointmentSlot> => {
    const response = await api.get<ApiResponse<AppointmentSlot>>(`/slots/${id}`);
    if (!response.data.data) throw new Error('Slot not found');
    return response.data.data;
  },

  create: async (
    doctorId: string,
    startTime: string,
    totalSeats?: number
  ): Promise<AppointmentSlot> => {
    const response = await api.post<ApiResponse<AppointmentSlot>>('/slots', {
      doctorId,
      startTime,
      totalSeats: totalSeats || 1,
    });
    if (!response.data.data) throw new Error('Failed to create slot');
    return response.data.data;
  },
};

// Bookings API
export const bookingApi = {
  create: async (
    slotId: string,
    userName: string,
    userEmail: string,
    seatsBooked?: number
  ): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', {
      slotId,
      userName,
      userEmail,
      seatsBooked: seatsBooked || 1,
    });
    if (!response.data.data) throw new Error('Failed to create booking');
    return response.data.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    if (!response.data.data) throw new Error('Booking not found');
    return response.data.data;
  },

  getBySlotId: async (slotId: string): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>(`/bookings/slot/${slotId}`);
    return response.data.data || [];
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings/my-bookings');
    return response.data.data || [];
  },

  getAll: async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings');
    return response.data.data || [];
  },

  cancel: async (bookingId: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/bookings/${bookingId}`);
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const response = await api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', {
      email,
      password,
    });
    if (!response.data.data) throw new Error('Login failed');
    return response.data.data;
  },

  getCurrentUser: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/auth/me');
    if (!response.data.data) throw new Error('Failed to get user info');
    return response.data.data;
  },
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

