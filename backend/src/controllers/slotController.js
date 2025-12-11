import AppointmentSlot from '../models/AppointmentSlot.js';
import Doctor from '../models/Doctor.js';

const createSlot = async (req, res, next) => {
  try {
    const { doctorId, startTime, totalSeats } = req.body;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Validate start time is in the future
    const startDate = new Date(startTime);
    if (startDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in the future'
      });
    }

    const slot = new AppointmentSlot({
      doctor_id: doctorId,
      start_time: startDate,
      total_seats: totalSeats || 1,
      available_seats: totalSeats || 1
    });
    
    await slot.save();
    
    // Populate doctor info for response
    await slot.populate('doctor_id', 'name specialization');
    
    // Transform response to match expected format
    const slotData = slot.toObject();
    slotData.doctor_name = slotData.doctor_id.name;
    slotData.specialization = slotData.doctor_id.specialization;
    slotData.doctor_id = slot.doctor_id._id;
    
    res.status(201).json({
      success: true,
      data: slotData
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    next(error);
  }
};

const getAllSlots = async (req, res, next) => {
  try {
    const slots = await AppointmentSlot.find({
      available_seats: { $gt: 0 },
      start_time: { $gt: new Date() }
    })
    .populate('doctor_id', 'name specialization')
    .sort({ start_time: 1 });
    
    // Transform response to match expected format
    const transformedSlots = slots.map(slot => {
      const slotObj = slot.toObject();
      return {
        ...slotObj,
        doctor_name: slotObj.doctor_id.name,
        specialization: slotObj.doctor_id.specialization,
        doctor_id: slotObj.doctor_id._id
      };
    });
    
    res.json({
      success: true,
      count: transformedSlots.length,
      data: transformedSlots
    });
  } catch (error) {
    next(error);
  }
};

const getSlotById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slot = await AppointmentSlot.findById(id)
      .populate('doctor_id', 'name specialization');
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    // Transform response to match expected format
    const slotObj = slot.toObject();
    slotObj.doctor_name = slotObj.doctor_id.name;
    slotObj.specialization = slotObj.doctor_id.specialization;
    slotObj.doctor_id = slotObj.doctor_id._id;
    
    res.json({
      success: true,
      data: slotObj
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    next(error);
  }
};

export {
  createSlot,
  getAllSlots,
  getSlotById
};
