import express from 'express';
import { body } from 'express-validator';
import { createDoctor, getAllDoctors, getDoctorById } from '../controllers/doctorController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create a new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               specialization:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Doctor name is required'),
    body('specialization').optional().trim()
  ],
  validate,
  createDoctor
);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 */
router.get('/', getAllDoctors);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectid
 *     responses:
 *       200:
 *         description: Doctor details
 *       404:
 *         description: Doctor not found
 */
router.get('/:id', getDoctorById);

export default router;

