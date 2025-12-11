import { pool } from '../config/database.js';
import * as SlotModel from '../models/AppointmentSlot.js';
import * as BookingModel from '../models/Booking.js';

const bookAppointment = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { slotId, userName, userEmail, seatsBooked } = req.body;
    const requestedSeats = seatsBooked || 1;
    const slotIdInt = parseInt(slotId);
    
    // Lock the slot row for update (SELECT FOR UPDATE)
    const slot = await SlotModel.getSlotByIdForUpdate(slotIdInt, client);
    
    if (!slot) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    // Check if slot is in the past
    if (new Date(slot.start_time) <= new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }
    
    // Check if enough seats available
    if (slot.available_seats < requestedSeats) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Only ${slot.available_seats} seat(s) available, but ${requestedSeats} requested`,
        availableSeats: slot.available_seats
      });
    }
    
    // Atomically decrement available seats
    const updatedSlot = await SlotModel.decrementAvailableSeats(
      slotIdInt,
      requestedSeats,
      client
    );
    
    if (!updatedSlot) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Not enough seats available'
      });
    }
    
    // Calculate expiry time (2 minutes from now)
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    
    // Create booking with CONFIRMED status
    const booking = await BookingModel.createBooking(
      slotIdInt,
      userName,
      userEmail.toLowerCase(),
      requestedSeats,
      'CONFIRMED',
      expiresAt,
      client
    );
    
    await client.query('COMMIT');
    
    // Get doctor info for response
    const doctorResult = await pool.query(
      `SELECT d.name, d.specialization 
       FROM doctors d
       INNER JOIN appointment_slots s ON d.id = s.doctor_id
       WHERE s.id = $1`,
      [slotIdInt]
    );
    
    const doctor = doctorResult.rows[0];
    
    // Transform response to match expected format
    const bookingObj = {
      id: booking.id.toString(),
      slot_id: booking.slot_id.toString(),
      user_name: booking.user_name,
      user_email: booking.user_email,
      seats_booked: booking.seats_booked,
      status: booking.status,
      created_at: booking.created_at,
      expires_at: booking.expires_at,
      updated_at: booking.updated_at,
      start_time: slot.start_time,
      doctor_id: slot.doctor_id.toString(),
      doctor_name: doctor.name,
      specialization: doctor.specialization
    };
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: bookingObj
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '22P02') { // Invalid input syntax
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    next(error);
  } finally {
    client.release();
  }
};

const cancelBooking = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const userEmail = req.user?.email;
    const bookingIdInt = parseInt(id);
    
    if (!userEmail) {
      await client.query('ROLLBACK');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Lock booking row for update
    const booking = await BookingModel.getBookingByIdForUpdate(bookingIdInt, client);
    
    if (!booking) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Verify the booking belongs to the authenticated user
    if (booking.user_email !== userEmail.toLowerCase()) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }
    
    // Don't allow canceling already failed bookings
    if (booking.status === 'FAILED') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a failed booking'
      });
    }
    
    // Release seats back to the slot atomically
    await SlotModel.incrementAvailableSeats(
      booking.slot_id,
      booking.seats_booked,
      client
    );
    
    // Delete the booking
    await BookingModel.deleteBooking(bookingIdInt, client);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '22P02') { // Invalid input syntax
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    next(error);
  } finally {
    client.release();
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.getBookingById(parseInt(id));
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Transform response to match expected format
    const bookingObj = {
      id: booking.id.toString(),
      slot_id: booking.slot_id.toString(),
      user_name: booking.user_name,
      user_email: booking.user_email,
      seats_booked: booking.seats_booked,
      status: booking.status,
      created_at: booking.created_at,
      expires_at: booking.expires_at,
      updated_at: booking.updated_at,
      start_time: booking.start_time,
      doctor_id: booking.doctor_id.toString(),
      doctor_name: booking.doctor_name,
      specialization: booking.specialization
    };
    
    res.json({
      success: true,
      data: bookingObj
    });
  } catch (error) {
    if (error.code === '22P02') { // Invalid input syntax
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    next(error);
  }
};

const getBookingsBySlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const bookings = await BookingModel.getBookingsBySlotId(parseInt(slotId));
    
    // Transform response
    const transformedBookings = bookings.map(booking => ({
      id: booking.id.toString(),
      slot_id: booking.slot_id.toString(),
      user_name: booking.user_name,
      user_email: booking.user_email,
      seats_booked: booking.seats_booked,
      status: booking.status,
      created_at: booking.created_at,
      expires_at: booking.expires_at,
      updated_at: booking.updated_at,
      start_time: booking.start_time,
      doctor_id: booking.doctor_id.toString(),
      doctor_name: booking.doctor_name,
      specialization: booking.specialization
    }));
    
    res.json({
      success: true,
      count: transformedBookings.length,
      data: transformedBookings
    });
  } catch (error) {
    if (error.code === '22P02') { // Invalid input syntax
      return res.status(404).json({
        success: false,
        message: 'Invalid slot ID'
      });
    }
    next(error);
  }
};

const getBookingsByUserEmail = async (req, res, next) => {
  try {
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const bookings = await BookingModel.getBookingsByUserEmail(userEmail.toLowerCase());
    
    // Transform response
    const transformedBookings = bookings.map(booking => ({
      id: booking.id.toString(),
      slot_id: booking.slot_id.toString(),
      user_name: booking.user_name,
      user_email: booking.user_email,
      seats_booked: booking.seats_booked,
      status: booking.status,
      created_at: booking.created_at,
      expires_at: booking.expires_at,
      updated_at: booking.updated_at,
      start_time: booking.start_time,
      doctor_id: booking.doctor_id.toString(),
      doctor_name: booking.doctor_name,
      specialization: booking.specialization
    }));
    
    res.json({
      success: true,
      count: transformedBookings.length,
      data: transformedBookings
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await BookingModel.getAllBookings();
    
    // Transform response
    const transformedBookings = bookings.map(booking => ({
      id: booking.id.toString(),
      slot_id: booking.slot_id.toString(),
      user_name: booking.user_name,
      user_email: booking.user_email,
      seats_booked: booking.seats_booked,
      status: booking.status,
      created_at: booking.created_at,
      expires_at: booking.expires_at,
      updated_at: booking.updated_at,
      start_time: booking.start_time,
      doctor_id: booking.doctor_id.toString(),
      doctor_name: booking.doctor_name,
      specialization: booking.specialization
    }));
    
    res.json({
      success: true,
      count: transformedBookings.length,
      data: transformedBookings
    });
  } catch (error) {
    next(error);
  }
};

export {
  bookAppointment,
  getBookingById,
  getBookingsBySlot,
  getBookingsByUserEmail,
  getAllBookings,
  cancelBooking
};
