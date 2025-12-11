import express from 'express';
import { body } from 'express-validator';
import { createSlot, getAllSlots, getSlotById } from '../controllers/slotController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Create a new appointment slot
 *     tags: [Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - startTime
 *             properties:
 *               doctorId:
 *                 type: string
 *                 format: objectid
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               totalSeats:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Slot created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Doctor not found
 */
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('doctorId').isMongoId().withMessage('Doctor ID must be a valid MongoDB ObjectId'),
    body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
    body('totalSeats').optional().isInt({ min: 1 }).withMessage('Total seats must be a positive integer')
  ],
  validate,
  createSlot
);

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Get all available appointment slots
 *     tags: [Slots]
 *     responses:
 *       200:
 *         description: List of available slots
 */
router.get('/', getAllSlots);

/**
 * @swagger
 * /api/slots/{id}:
 *   get:
 *     summary: Get slot by ID
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectid
 *     responses:
 *       200:
 *         description: Slot details
 *       404:
 *         description: Slot not found
 */
router.get('/:id', getSlotById);

export default router;

