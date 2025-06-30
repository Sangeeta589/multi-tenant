import express from 'express';
import { getNotifications,getNotificationCount,getMarkRead} from '../controllers/notificationController.js';

const router = express.Router();

//router.post('/', saveNotification);
router.get('/', getNotifications);
router.get('/notifications/count', getNotificationCount);
router.put('/notifications/mark-read',getMarkRead);

export default router;
