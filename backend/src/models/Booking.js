import { pool } from '../config/database.js';

// Booking model functions using PostgreSQL

export const createBooking = async (slotId, userName, userEmail, seatsBooked, status, expiresAt, client = null) => {
  const queryClient = client || pool;
  
  const result = await queryClient.query(
    `INSERT INTO bookings (slot_id, user_name, user_email, seats_booked, status, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [slotId, userName, userEmail, seatsBooked, status, expiresAt]
  );
  return result.rows[0];
};

export const getBookingById = async (id) => {
  const result = await pool.query(
    `SELECT 
      b.*,
      s.start_time,
      s.doctor_id,
      d.name as doctor_name,
      d.specialization
     FROM bookings b
     INNER JOIN appointment_slots s ON b.slot_id = s.id
     INNER JOIN doctors d ON s.doctor_id = d.id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const getBookingsBySlotId = async (slotId) => {
  const result = await pool.query(
    `SELECT 
      b.*,
      s.start_time,
      s.doctor_id,
      d.name as doctor_name,
      d.specialization
     FROM bookings b
     INNER JOIN appointment_slots s ON b.slot_id = s.id
     INNER JOIN doctors d ON s.doctor_id = d.id
     WHERE b.slot_id = $1
     ORDER BY b.created_at DESC`,
    [slotId]
  );
  return result.rows;
};

export const getBookingsByUserEmail = async (userEmail) => {
  const result = await pool.query(
    `SELECT 
      b.*,
      s.start_time,
      s.doctor_id,
      d.name as doctor_name,
      d.specialization
     FROM bookings b
     INNER JOIN appointment_slots s ON b.slot_id = s.id
     INNER JOIN doctors d ON s.doctor_id = d.id
     WHERE b.user_email = $1
     ORDER BY b.created_at DESC`,
    [userEmail]
  );
  return result.rows;
};

export const getAllBookings = async () => {
  const result = await pool.query(
    `SELECT 
      b.*,
      s.start_time,
      s.doctor_id,
      d.name as doctor_name,
      d.specialization
     FROM bookings b
     INNER JOIN appointment_slots s ON b.slot_id = s.id
     INNER JOIN doctors d ON s.doctor_id = d.id
     ORDER BY b.created_at DESC`
  );
  return result.rows;
};

export const getExpiredPendingBookings = async (client) => {
  const result = await client.query(
    `SELECT * FROM bookings
     WHERE status = 'PENDING' AND expires_at < NOW()`
  );
  return result.rows;
};

export const updateBookingStatus = async (bookingIds, status, client) => {
  const result = await client.query(
    `UPDATE bookings
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = ANY($2::int[])
     RETURNING *`,
    [status, bookingIds]
  );
  return result.rows;
};

export const deleteBooking = async (id, client = null) => {
  const queryClient = client || pool;
  
  const result = await queryClient.query(
    'DELETE FROM bookings WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

export const getBookingByIdForUpdate = async (id, client) => {
  const result = await client.query(
    'SELECT * FROM bookings WHERE id = $1 FOR UPDATE',
    [id]
  );
  return result.rows[0];
};

export default {
  createBooking,
  getBookingById,
  getBookingsBySlotId,
  getBookingsByUserEmail,
  getAllBookings,
  getExpiredPendingBookings,
  updateBookingStatus,
  deleteBooking,
  getBookingByIdForUpdate
};
