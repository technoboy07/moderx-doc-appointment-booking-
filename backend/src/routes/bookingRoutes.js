import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validation.js';
import { bookAppointment, getBookingById, getBookingsBySlot, getBookingsByUserEmail, getAllBookings, cancelBooking } from '../controllers/bookingController.js';

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Book an appointment
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotId
 *               - userName
 *               - userEmail
 *             properties:
 *               slotId:
 *                 type: string
 *                 format: objectid
 *               userName:
 *                 type: string
 *               userEmail:
 *                 type: string
 *                 format: email
 *               seatsBooked:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Not enough seats available
 */
router.post(
  '/',
  [
    body('slotId').isMongoId().withMessage('Slot ID must be a valid MongoDB ObjectId'),
    body('userName').trim().notEmpty().withMessage('User name is required'),
    body('userEmail').isEmail().withMessage('Valid email is required'),
    body('seatsBooked').optional().isInt({ min: 1 }).withMessage('Seats booked must be a positive integer')
  ],
  validate,
  bookAppointment
);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get all bookings for the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings for the authenticated user
 *       401:
 *         description: Unauthorized
 */
router.get('/my-bookings', authenticateToken, getBookingsByUserEmail);

/**
 * @swagger
 * /api/bookings/slot/{slotId}:
 *   get:
 *     summary: Get all bookings for a slot
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectid
 *     responses:
 *       200:
 *         description: List of bookings for the slot
 */
router.get('/slot/:slotId', getBookingsBySlot);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/', authenticateToken, requireAdmin, getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectid
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
router.get('/:id', getBookingById);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking (User can only cancel their own bookings)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectid
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot cancel other users' bookings
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', authenticateToken, cancelBooking);

export default router;

