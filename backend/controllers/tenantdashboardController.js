import Resource from '../models/Resource.js';
import Tenant from '../models/Tenant.js';
import logger from '../utils/logger.js';
import Notification from '../models/Notification.js';
import AccessLog from '../models/AccessLog.js';
import { saveNotification } from './notificationController.js';
// Get all tenants (for dropdown list)
export const getAllTenants = async (req, res) => {
  try {
    if ((req.user?.role || "").toLowerCase() !== "tenant-admin") {
  console.log("⛔ Access denied for role:", req.user?.role);
  return res.status(403).json({ message: "Access denied" });
}


    const tenants = await Tenant.find().sort({ createdAt: -1 });
    logger.info(`All tenants viewed by TenantAdmin ${req.user.id}`);
    res.status(200).json(tenants);
  } catch (error) {
    logger.error(`Error fetching tenants: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Get resources created by the current Tenant Admin
export const getResources = async (req, res) => {
  try {
    const { id, role } = req.user;

    if ((req.user?.role || "").toLowerCase() !== "tenant-admin") {
  console.log("⛔ Access denied for role:", req.user?.role);
  return res.status(403).json({ message: "Access denied" });
}


    const resources = await Resource.find({ createdBy: id });

    const formatted = await Promise.all(
      resources.map(async (res) => {
        const tenant = await Tenant.findOne({ tenantId: res.tenantId });
        return {
          ...res.toObject(),
          tenantName: tenant?.tenantName || "Unknown Tenant",
          tenantUUID: res.tenantId
        };
      })
    );

    logger.info(`Resources viewed by TenantAdmin ${id}`);
    res.status(200).json(formatted);
  } catch (error) {
    logger.error(`Get Resources Error: ${error.message}`);
    res.status(500).json({ message: "Error fetching resources" });
  }
};

export const getAccessLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find().sort({ accessedAt: -1 });

    for (const log of logs) {
      if (!log || !log.email || !log.accessedAt) continue;

      // Only notify if not tenant-admin/super-admin
      if (!["tenant-admin", "super-admin"].includes(log.role)) {
        const notificationMessage = `${log.username} accessed tenant ${log.tenantName}`;

        // Check if a notification already exists for this exact access
        const existing = await Notification.findOne({
          type: "access-log",
          "note.email": log.email,
          "note.accessedAt": log.accessedAt,
        });

        if (!existing) {
          console.log("🔔 Creating notification for access log:", log.username, log.tenantName);

          await saveNotification({
            type: "access-log",
            title: "User Access Notification",
            message: notificationMessage,
            recipientType: "tenant-admin", // must match your filter in frontend
            note: {
              username: log.username,
              email: log.email,
              tenantId: log.tenantId,
              tenantName: log.tenantName,
              role: log.role,
              accessedAt: log.accessedAt,
            },
          });
        }
      }
    }

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching access logs:", error.message);
    res.status(500).json({ message: "Error fetching access logs" });
  }
};