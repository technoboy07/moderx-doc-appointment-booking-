import Doctor from '../models/Doctor.js';

const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization } = req.body;
    const doctor = new Doctor({
      name,
      specialization: specialization || null
    });
    await doctor.save();
    
    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    next(error);
  }
};

export {
  createDoctor,
  getAllDoctors,
  getDoctorById
};
