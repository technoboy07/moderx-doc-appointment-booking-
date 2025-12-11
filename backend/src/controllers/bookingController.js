import mongoose from 'mongoose';
import AppointmentSlot from '../models/AppointmentSlot.js';
import Booking from '../models/Booking.js';

const bookAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    const { slotId, userName, userEmail, seatsBooked } = req.body;
    const requestedSeats = seatsBooked || 1;
    
    // Atomic operation: Find and update in one query to prevent race conditions
    const slot = await AppointmentSlot.findOneAndUpdate(
      { 
        _id: slotId,
        available_seats: { $gte: requestedSeats }, // Ensure enough seats
        start_time: { $gt: new Date() } // Not in the past
      },
      { 
        $inc: { available_seats: -requestedSeats } // Atomic decrement
      },
      { 
        new: true, 
        session,
        runValidators: true 
      }
    ).populate('doctor_id', 'name specialization');
    
    if (!slot) {
      await session.abortTransaction();
      
      // Check if slot exists but doesn't meet conditions
      const slotExists = await AppointmentSlot.findById(slotId).session(session);
      if (!slotExists) {
        return res.status(404).json({
          success: false,
          message: 'Slot not found'
        });
      }
      
      if (slotExists.available_seats < requestedSeats) {
        return res.status(409).json({
          success: false,
          message: `Only ${slotExists.available_seats} seat(s) available, but ${requestedSeats} requested`,
          availableSeats: slotExists.available_seats
        });
      }
      
      if (new Date(slotExists.start_time) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot book appointments in the past'
        });
      }
      
      return res.status(409).json({
        success: false,
        message: 'Not enough seats available'
      });
    }
    
    // Calculate expiry time (2 minutes from now)
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    
    // Create booking with CONFIRMED status
    const booking = new Booking({
      slot_id: slotId,
      user_name: userName,
      user_email: userEmail,
      seats_booked: requestedSeats,
      status: 'CONFIRMED',
      expires_at: expiresAt
    });
    
    await booking.save({ session });
    await session.commitTransaction();
    
    // Populate booking with slot and doctor info
    await booking.populate({
      path: 'slot_id',
      populate: { path: 'doctor_id', select: 'name specialization' }
    });
    
    // Transform response to match expected format
    const bookingObj = booking.toObject();
    if (bookingObj.slot_id) {
      bookingObj.start_time = bookingObj.slot_id.start_time;
      bookingObj.doctor_id = bookingObj.slot_id.doctor_id._id;
      bookingObj.doctor_name = bookingObj.slot_id.doctor_id.name;
    }
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: bookingObj
    });
  } catch (error) {
    await session.abortTransaction();
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    next(error);
  } finally {
    await session.endSession();
  }
};

const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    const { id } = req.params;
    const userEmail = req.user?.email; // Get email from authenticated user
    
    if (!userEmail) {
      await session.abortTransaction();
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Find booking and verify it belongs to the user
    const booking = await Booking.findById(id).session(session);
    
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Verify the booking belongs to the authenticated user
    if (booking.user_email !== userEmail) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }
    
    // Don't allow canceling already failed bookings
    if (booking.status === 'FAILED') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a failed booking'
      });
    }
    
    // Release seats back to the slot atomically
    await AppointmentSlot.findByIdAndUpdate(
      booking.slot_id,
      { $inc: { available_seats: booking.seats_booked } },
      { session }
    );
    
    // Delete the booking
    await Booking.findByIdAndDelete(id).session(session);
    
    await session.commitTransaction();
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    next(error);
  } finally {
    await session.endSession();
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate({
        path: 'slot_id',
        populate: { path: 'doctor_id', select: 'name specialization' }
      });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Transform response to match expected format
    const bookingObj = booking.toObject();
    if (bookingObj.slot_id) {
      bookingObj.start_time = bookingObj.slot_id.start_time;
      bookingObj.doctor_id = bookingObj.slot_id.doctor_id._id;
      bookingObj.doctor_name = bookingObj.slot_id.doctor_id.name;
    }
    
    res.json({
      success: true,
      data: bookingObj
    });
  } catch (error) {
    if (error.name === 'CastError') {
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
    const bookings = await Booking.find({ slot_id: slotId })
      .populate({
        path: 'slot_id',
        populate: { path: 'doctor_id', select: 'name specialization' }
      })
      .sort({ createdAt: -1 });
    
    // Transform response
    const transformedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      if (bookingObj.slot_id) {
        bookingObj.start_time = bookingObj.slot_id.start_time;
        bookingObj.doctor_id = bookingObj.slot_id.doctor_id._id;
        bookingObj.doctor_name = bookingObj.slot_id.doctor_id.name;
      }
      return bookingObj;
    });
    
    res.json({
      success: true,
      count: transformedBookings.length,
      data: transformedBookings
    });
  } catch (error) {
    if (error.name === 'CastError') {
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
    // Use authenticated user's email from token (privacy protection)
    // Users can only view their own bookings
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const bookings = await Booking.find({ user_email: userEmail })
      .populate({
        path: 'slot_id',
        populate: { path: 'doctor_id', select: 'name specialization' }
      })
      .sort({ createdAt: -1 });
    
    // Transform response
    const transformedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      if (bookingObj.slot_id) {
        bookingObj.start_time = bookingObj.slot_id.start_time;
        bookingObj.doctor_id = bookingObj.slot_id.doctor_id._id;
        bookingObj.doctor_name = bookingObj.slot_id.doctor_id.name;
      }
      return bookingObj;
    });
    
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
    const bookings = await Booking.find()
      .populate({
        path: 'slot_id',
        populate: { path: 'doctor_id', select: 'name specialization' }
      })
      .sort({ createdAt: -1 });
    
    // Transform response
    const transformedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      if (bookingObj.slot_id) {
        bookingObj.start_time = bookingObj.slot_id.start_time;
        bookingObj.doctor_id = bookingObj.slot_id.doctor_id._id;
        bookingObj.doctor_name = bookingObj.slot_id.doctor_id.name;
      }
      return bookingObj;
    });
    
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
