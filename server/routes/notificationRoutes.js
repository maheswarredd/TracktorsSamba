import express from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllRead,
  getVapidPublicKey,
  savePushSubscription,
  removePushSubscription
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.use(protect);
router.post('/subscribe', savePushSubscription);
router.post('/unsubscribe', removePushSubscription);
router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllRead);

export default router;
