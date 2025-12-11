import { pool } from '../config/database.js';

// Doctor model functions using PostgreSQL

export const createDoctor = async (name, specialization = null) => {
  const result = await pool.query(
    'INSERT INTO doctors (name, specialization) VALUES ($1, $2) RETURNING *',
    [name, specialization]
  );
  return result.rows[0];
};

export const getAllDoctors = async () => {
  const result = await pool.query(
    'SELECT * FROM doctors ORDER BY created_at DESC'
  );
  return result.rows;
};

export const getDoctorById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM doctors WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

export const findDoctorByName = async (name) => {
  const result = await pool.query(
    'SELECT * FROM doctors WHERE name = $1',
    [name]
  );
  return result.rows[0];
};

export default {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  findDoctorByName
};
