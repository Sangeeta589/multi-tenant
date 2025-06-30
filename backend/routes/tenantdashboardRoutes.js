//routes/tenantdashboardRoutes.js

import express from "express";
import { getAllTenants, getResources,getAccessLogs} from "../controllers/tenantdashboardController.js";
import {authenticate, authMiddleware} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/tenants", authMiddleware, getAllTenants);
router.get("/resources", authMiddleware, getResources);
router.get('/access-logs', authMiddleware, getAccessLogs);
export default router;
