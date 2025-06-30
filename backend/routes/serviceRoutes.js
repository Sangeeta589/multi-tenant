// routes/serviceRoutes.js
import express from "express";
const router = express.Router();
import { getServiceByCategory,createService,getAllServices} from "../controllers/serviceController.js";


// GET - get a service by title
router.post("/", createService);           // Admin adds service
router.get("/all", getAllServices);
router.get("/", getServiceByCategory);

export default router;
