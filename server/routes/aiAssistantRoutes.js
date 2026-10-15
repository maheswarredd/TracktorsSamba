import express from 'express';
import { protect } from '../middleware/auth.js';
import { askAI } from '../services/aiAssistantService.js';

const router = express.Router();

router.use(protect);

router.post('/', async (req, res) => {
  try {
    const {
      message,
      conversation
    } = req.body;

    if (
      !message ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'AI assistant message is required'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          'AI assistant message is too long'
      });
    }

    const result =
      await askAI({
        user: req.user,
        message: message.trim(),
        conversation:
          Array.isArray(conversation)
            ? conversation
            : []
      });

    const allowedActions =
      new Set([
        'NONE',
        'OPEN_BOOKING',
        'OPEN_FARMER_DASHBOARD',
        'OPEN_RIDER_DASHBOARD',
        'OPEN_ADMIN_DASHBOARD',
        'GET_MY_BOOKINGS',
        'GET_BOOKING_STATUS',
        'GET_MY_PAYMENTS',
        'GET_MY_PROFILE',
        'GET_SERVICES',
        'GET_RIDER_EARNINGS',
        'GET_RIDER_DETAILS',
        'GET_TRACTOR_DETAILS',
        'ASSIGN_RIDER_AND_TRACTOR',
        'VERIFY_PAYMENT',
        'CREATE_BOOKING',
        'CANCEL_BOOKING',
        'OPEN_PAYMENT_PAGE'
      ]);

    if (
      !allowedActions.has(
        result.action
      )
    ) {
      result.action = 'NONE';
      result.parameters = {};
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(
      'AI assistant error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        'AI assistant failed'
    });
  }
});

export default router;
