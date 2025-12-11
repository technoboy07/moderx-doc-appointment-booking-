export interface Doctor {
  id: string; // PostgreSQL integer ID (as string)
  name: string;
  specialization: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentSlot {
  id: string; // PostgreSQL integer ID (as string)
  doctor_id: string; // PostgreSQL integer ID (as string)
  doctor_name: string;
  specialization: string | null;
  start_time: string;
  total_seats: number;
  available_seats: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string; // PostgreSQL integer ID (as string)
  slot_id: string; // PostgreSQL integer ID (as string)
  user_name: string;
  user_email: string;
  seats_booked: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  created_at: string;
  expires_at: string | null;
  updated_at: string;
  start_time?: string;
  doctor_id?: string; // PostgreSQL integer ID (as string)
  doctor_name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  errors?: any[];
}

