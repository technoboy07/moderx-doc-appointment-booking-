import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import AppointmentSlot from '../models/AppointmentSlot.js';

/**
 * Job to expire pending bookings that have exceeded the 2-minute expiry time
 * This should be run periodically (e.g., every 30 seconds)
 */
async function expirePendingBookings() {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    // Find expired pending bookings
    const expiredBookings = await Booking.find({
      status: 'PENDING',
      expires_at: { $lt: new Date() }
    }).session(session);
    
    if (expiredBookings.length === 0) {
      await session.abortTransaction();
      return { expired: 0 };
    }
    
    // Group seats to release by slot_id
    const slotUpdates = {};
    
    expiredBookings.forEach(booking => {
      const slotId = booking.slot_id.toString();
      if (!slotUpdates[slotId]) {
        slotUpdates[slotId] = 0;
      }
      slotUpdates[slotId] += booking.seats_booked;
    });
    
    // Release seats for each slot atomically
    for (const [slotId, seatsToRelease] of Object.entries(slotUpdates)) {
      await AppointmentSlot.findByIdAndUpdate(
        slotId,
        { $inc: { available_seats: seatsToRelease } },
        { session }
      );
    }
    
    // Mark bookings as FAILED
    await Booking.updateMany(
      { _id: { $in: expiredBookings.map(b => b._id) } },
      { status: 'FAILED' },
      { session }
    );
    
    await session.commitTransaction();
    
    console.log(`✅ Expired ${expiredBookings.length} pending booking(s)`);
    return { expired: expiredBookings.length };
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Error expiring bookings:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}

export default expirePendingBookings;
