//routes/adminRoutes.js

import express from "express";
import { getAllUsers,approveRegistration, declineRegistration, ActionIncident ,ActionServices,changePassword,
  removeUser,
  editUserRole} from "../controllers/adminController.js";
import PendingRegistration from "../models/PendingUser.js";
import { authenticate, protect } from "../middleware/authMiddleware.js"; // Ensure only authenticated users can access

const router = express.Router();

router.use(protect); // Protect all admin routes

router.post("/approve/:id", approveRegistration);

router.delete("/decline/:id", declineRegistration);

router.get("/pending-registrations", async (req, res) => {
    try {
        // ✅ Ensure only super-admins can view pending registrations
        if (req.user.role !== "super-admin") {
            return res.status(403).json({ message: "Access denied. Super Admins only." });
        }

        const pendingUsers = await PendingRegistration.find({ status: "pending" });
        res.json(pendingUsers);
    } catch (error) {
        console.error("Error fetching pending registrations:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get('/users', getAllUsers);
router.put('/action/:id',ActionIncident);
router.put("/action/service/:id", ActionServices);
router.post('/change-password', authenticate, changePassword);
router.delete('/user/:userId', authenticate, removeUser);
router.put('/user/:userId/role', authenticate, editUserRole);

export default router;

