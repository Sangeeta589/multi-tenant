import Notification from '../models/Notification.js';

/**
 * Save a new notification to the database
 */
export const saveNotification = async ({
  type,
  title,
  message,
  recipientType,
  incidentId,
  requestId,
  note,
  entityType
}) => {
  if (!recipientType) {
    throw new Error("recipientType is required");
  }

  try {
    const notification = new Notification({
      type,
      title,
      message,
      recipientType,
      incidentId,
      requestId,
      note,
      entityType,
      status: 'unread',
      createdAt: new Date(),
    });

    const saved = await notification.save();
    console.log("✅ Notification saved:", {
      _id: saved._id,
      recipientType: saved.recipientType,
      message: saved.message,
      createdAt: saved.createdAt
    });

    return saved;
  } catch (err) {
    console.error("❌ Notification save failed:", err.message);
    throw err;
  }
};

/**
 * Get all notifications for a given recipientType
 */
export const getNotifications = async (req, res) => {
  const { recipientType } = req.query;
  console.log("📥 Received getNotifications:", { recipientType });

  if (!recipientType) {
    return res.status(400).json({ message: "Missing recipientType" });
  }

  try {
    const filter = { recipientType };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📤 Fetched notifications: ${notifications.length} for recipientType: ${recipientType}`);
    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Notification fetch failed:", err.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * Get count of unread notifications for a recipientType
 */
export const getNotificationCount = async (req, res) => {
  const { recipientType } = req.query;

  if (!recipientType) {
    return res.status(400).json({ message: "Missing recipientType" });
  }

  try {
    const count = await Notification.countDocuments({
      recipientType,
      status: 'unread',
    });

    console.log(`🔢 Notification count for ${recipientType}: ${count}`);
    res.status(200).json({ count });
  } catch (err) {
    console.error("❌ Count fetch failed:", err.message);
    res.status(500).json({ message: "Failed to count notifications" });
  }
};

/**
 * Mark all unread notifications as read for a recipientType
 */
export const getMarkRead = async (req, res) => {
  const { recipientType } = req.body;

  if (!recipientType) {
    return res.status(400).json({ message: "Missing recipientType" });
  }

  try {
    const result = await Notification.updateMany(
      { recipientType, status: 'unread' },
      { $set: { status: 'read' } }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read for ${recipientType}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Failed to mark notifications as read:", err.message);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};
