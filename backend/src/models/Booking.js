import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  slot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppointmentSlot',
    required: true
  },
  user_name: {
    type: String,
    required: true,
    trim: true
  },
  user_email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  seats_booked: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'FAILED'],
    default: 'PENDING'
  },
  expires_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookingSchema.index({ slot_id: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ expires_at: 1 });
bookingSchema.index({ status: 1, expires_at: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
