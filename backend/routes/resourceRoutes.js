// routes/resourceRoutes.js

import express from "express";
import { createResource, deleteResource, getResources,updateResource ,getUserResources, ViewResources} from "../controllers/resourceController.js";
import { authenticate, authMiddleware, protect} from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/create", authMiddleware,createResource);

router.get("/", authMiddleware, getResources);

router.put('/:id', protect, updateResource);

router.delete('/:id', protect, deleteResource);

router.get('/user',authenticate, getUserResources);

router.get("/view/:id",ViewResources);
export default router;



