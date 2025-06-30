import express from "express";
import {
  createIncident,
  getAllIncidents,
  getIncidentsByUserIdPrefix,
  getIncidentsByCreator, ViewIncident,NoteIncident,
  EditIncident,
  ActionIncident
} from "../controllers/incidentController.js";
import {authenticate} from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/", createIncident);

// Clear and unambiguous route paths:
router.get("/all", getAllIncidents); // Optional, for admin

router.get("/user/id/:userId", getIncidentsByUserIdPrefix);
router.get("/user/name/:nameOrEmail", getIncidentsByCreator);

router.get("/view/:id",ViewIncident);

router.post("/notes/:id",authenticate,NoteIncident);
router.put("/edit/:id",authenticate,EditIncident)

router.put("/action/:id",authenticate,ActionIncident);
export default router;
