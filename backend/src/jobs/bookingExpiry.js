import { pool } from '../config/database.js';
import * as BookingModel from '../models/Booking.js';
import * as SlotModel from '../models/AppointmentSlot.js';

/**
 * Job to expire pending bookings that have exceeded the 2-minute expiry time
 * This should be run periodically (e.g., every 30 seconds)
 */
async function expirePendingBookings() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find expired pending bookings
    const expiredBookings = await BookingModel.getExpiredPendingBookings(client);
    
    if (expiredBookings.length === 0) {
      await client.query('ROLLBACK');
      return { expired: 0 };
    }
    
    // Group seats to release by slot_id
    const slotUpdates = {};
    
    expiredBookings.forEach(booking => {
      const slotId = booking.slot_id;
      if (!slotUpdates[slotId]) {
        slotUpdates[slotId] = 0;
      }
      slotUpdates[slotId] += booking.seats_booked;
    });
    
    // Release seats for each slot atomically
    for (const [slotId, seatsToRelease] of Object.entries(slotUpdates)) {
      await SlotModel.incrementAvailableSeats(
        parseInt(slotId),
        seatsToRelease,
        client
      );
    }
    
    // Mark bookings as FAILED
    const bookingIds = expiredBookings.map(b => b.id);
    await BookingModel.updateBookingStatus(bookingIds, 'FAILED', client);
    
    await client.query('COMMIT');
    
    console.log(`✅ Expired ${expiredBookings.length} pending booking(s)`);
    return { expired: expiredBookings.length };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error expiring bookings:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default expirePendingBookings;
