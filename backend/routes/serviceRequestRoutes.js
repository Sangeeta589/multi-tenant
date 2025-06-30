import express from "express";
const router = express.Router();

import {
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestsByUser,
  getServiceRequestById,
  getUserServiceRequests,
  ViewServices,
  NoteServices,
  EditServices,
  ActionServices,

} from "../controllers/serviceRequestController.js";
import { getServiceByCategory } from "../controllers/serviceController.js";
import {authenticate} from "../middleware/authMiddleware.js";
// Specific routes first
router.post("/", createServiceRequest);
router.get("/view/:id", ViewServices);
router.post("/notes/:id",authenticate, NoteServices);
router.put("/edit/:id", authenticate,EditServices);
router.put("/action/:id",authenticate, ActionServices);
router.get("/user/id/:userId", getServiceRequestsByUser);
router.get("/user/:emailPrefix", getUserServiceRequests);
router.get("/service", getServiceByCategory);

// Less specific routes last
router.get("/all", getAllServiceRequests);
router.get("/:id", getServiceRequestById);  // KEEP THIS LAST

export default router;
