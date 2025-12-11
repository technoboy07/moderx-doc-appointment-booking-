import { pool } from '../config/database.js';

// AppointmentSlot model functions using PostgreSQL

export const createSlot = async (doctorId, startTime, totalSeats, availableSeats) => {
  const result = await pool.query(
    `INSERT INTO appointment_slots (doctor_id, start_time, total_seats, available_seats)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [doctorId, startTime, totalSeats, availableSeats]
  );
  return result.rows[0];
};

export const getAllSlots = async () => {
  const result = await pool.query(
    `SELECT 
      s.*,
      d.name as doctor_name,
      d.specialization
     FROM appointment_slots s
     INNER JOIN doctors d ON s.doctor_id = d.id
     WHERE s.available_seats > 0 AND s.start_time > NOW()
     ORDER BY s.start_time ASC`
  );
  return result.rows;
};

export const getSlotById = async (id) => {
  const result = await pool.query(
    `SELECT 
      s.*,
      d.name as doctor_name,
      d.specialization
     FROM appointment_slots s
     INNER JOIN doctors d ON s.doctor_id = d.id
     WHERE s.id = $1`,
    [id]
  );
  return result.rows[0];
};

// Atomic update with SELECT FOR UPDATE for concurrency control
export const decrementAvailableSeats = async (slotId, seatsToBook, client = null) => {
  const queryClient = client || pool;
  
  // Use SELECT FOR UPDATE to lock the row
  const result = await queryClient.query(
    `UPDATE appointment_slots
     SET available_seats = available_seats - $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
       AND available_seats >= $1
       AND start_time > NOW()
     RETURNING *`,
    [seatsToBook, slotId]
  );
  
  return result.rows[0];
};

export const incrementAvailableSeats = async (slotId, seatsToRelease, client = null) => {
  const queryClient = client || pool;
  
  const result = await queryClient.query(
    `UPDATE appointment_slots
     SET available_seats = available_seats + $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [seatsToRelease, slotId]
  );
  
  return result.rows[0];
};

export const getSlotByIdForUpdate = async (slotId, client) => {
  const result = await client.query(
    `SELECT * FROM appointment_slots WHERE id = $1 FOR UPDATE`,
    [slotId]
  );
  return result.rows[0];
};

export default {
  createSlot,
  getAllSlots,
  getSlotById,
  decrementAvailableSeats,
  incrementAvailableSeats,
  getSlotByIdForUpdate
};
