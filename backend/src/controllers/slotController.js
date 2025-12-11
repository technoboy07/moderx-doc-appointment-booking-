import * as SlotModel from '../models/AppointmentSlot.js';
import * as DoctorModel from '../models/Doctor.js';

const createSlot = async (req, res, next) => {
  try {
    const { doctorId, startTime, totalSeats } = req.body;

    // Verify doctor exists
    const doctor = await DoctorModel.getDoctorById(parseInt(doctorId));
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

    const totalSeatsValue = totalSeats || 1;
    const slot = await SlotModel.createSlot(
      parseInt(doctorId),
      startDate,
      totalSeatsValue,
      totalSeatsValue
    );
    
    // Format response
    const slotData = {
      id: slot.id.toString(),
      doctor_id: slot.doctor_id.toString(),
      doctor_name: doctor.name,
      specialization: doctor.specialization,
      start_time: slot.start_time,
      total_seats: slot.total_seats,
      available_seats: slot.available_seats,
      created_at: slot.created_at,
      updated_at: slot.updated_at
    };
    
    res.status(201).json({
      success: true,
      data: slotData
    });
  } catch (error) {
    if (error.code === '22P02') { // Invalid input syntax
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
    const slots = await SlotModel.getAllSlots();
    
    // Transform response to match expected format
    const transformedSlots = slots.map(slot => ({
      id: slot.id.toString(),
      doctor_id: slot.doctor_id.toString(),
      doctor_name: slot.doctor_name,
      specialization: slot.specialization,
      start_time: slot.start_time,
      total_seats: slot.total_seats,
      available_seats: slot.available_seats,
      created_at: slot.created_at,
      updated_at: slot.updated_at
    }));
    
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
    const slot = await SlotModel.getSlotById(parseInt(id));
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    // Transform response to match expected format
    const slotObj = {
      id: slot.id.toString(),
      doctor_id: slot.doctor_id.toString(),
      doctor_name: slot.doctor_name,
      specialization: slot.specialization,
      start_time: slot.start_time,
      total_seats: slot.total_seats,
      available_seats: slot.available_seats,
      created_at: slot.created_at,
      updated_at: slot.updated_at
    };
    
    res.json({
      success: true,
      data: slotObj
    });
  } catch (error) {
    if (error.code === '22P02') { // Invalid input syntax
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
