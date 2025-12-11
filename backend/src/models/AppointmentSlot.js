import mongoose from 'mongoose';

const appointmentSlotSchema = new mongoose.Schema({
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  start_time: {
    type: Date,
    required: true
  },
  total_seats: {
    type: Number,
    required: true,
    min: 1
  },
  available_seats: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validation: available_seats cannot exceed total_seats
appointmentSlotSchema.pre('save', function(next) {
  if (this.available_seats > this.total_seats) {
    next(new Error('Available seats cannot exceed total seats'));
  } else {
    next();
  }
});

// Indexes for performance
appointmentSlotSchema.index({ doctor_id: 1, start_time: 1 });
appointmentSlotSchema.index({ available_seats: 1 });
appointmentSlotSchema.index({ start_time: 1 });

const AppointmentSlot = mongoose.model('AppointmentSlot', appointmentSlotSchema);

export default AppointmentSlot;
