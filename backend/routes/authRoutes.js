//routes/authRoutes.js

import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect} from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import dotenv from "dotenv";
//import { getAllTenants } from "../controllers/tenantController.js";
//import { getUserResources } from "../controllers/resourceController.js";

dotenv.config();
const router = express.Router();

router.post("/register", register); // Unified registration endpoint
router.post("/login", login); // Unified login endpoint

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email tenantId role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



export default router;
