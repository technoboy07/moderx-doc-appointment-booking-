import * as DoctorModel from '../models/Doctor.js';

const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization } = req.body;
    const doctor = await DoctorModel.createDoctor(name, specialization || null);
    
    res.status(201).json({
      success: true,
      data: {
        id: doctor.id.toString(),
        name: doctor.name,
        specialization: doctor.specialization,
        created_at: doctor.created_at,
        updated_at: doctor.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await DoctorModel.getAllDoctors();
    
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      created_at: doctor.created_at,
      updated_at: doctor.updated_at
    }));
    
    res.json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorModel.getDoctorById(parseInt(id));
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: doctor.id.toString(),
        name: doctor.name,
        specialization: doctor.specialization,
        created_at: doctor.created_at,
        updated_at: doctor.updated_at
      }
    });
  } catch (error) {
    if (error.code === '22P02') { // Invalid input syntax for integer
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
