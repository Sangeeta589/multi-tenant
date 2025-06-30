//routes/tenantRoutes.js

import express from 'express';
import { createTenant,getAllTenants ,validateTenantByName,updateTenant} from '../controllers/tenantController.js';
import { protect,authorizeRoles, authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/create-tenant', protect, authorizeRoles(["tenant-admin"]), createTenant);


router.get('/all', protect, getAllTenants);

router.put('/:id', protect, authorizeRoles(["tenant-admin"]), updateTenant);

router.post("/validate-by-name", validateTenantByName);




export default router;
