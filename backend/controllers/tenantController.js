//controllers/tenantController.js

import Tenant from '../models/Tenant.js';
import logger from '../utils/logger.js';

export const createTenant = async (req, res) => {
  try {
    const { tenantName, tenantId } = req.body;

    if (!tenantName || !tenantId) {
      logger.warn("Tenant creation failed: Missing tenantName or tenantId");
      return res.status(400).json({ message: "tenantName and tenantId are required" });
    }

    if (!req.user || !req.user.id) {
      logger.warn("Tenant creation failed: User not authenticated");
      return res.status(401).json({ message: "User  not authenticated" });
    }

    const existing = await Tenant.findOne({ tenantId });
    if (existing) {
      logger.warn(`Tenant creation failed: TenantId ${tenantId} already exists`);
      return res.status(409).json({ message: "Tenant ID already exists" });
    }

    const tenant = await Tenant.create({ tenantName, tenantId, createdBy: req.user.email });

    logger.info(`Tenant Created - Name: ${tenantName}, TenantId: ${tenantId}, Created By: ${req.user.id}`);
    res.status(201).json({ message: "Tenant created successfully", tenant });
  } catch (error) {
    logger.error(`Error creating tenant: ${error.message}`, error);
    console.error("Error creating tenant:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAllTenants = async (req, res) => {
  try {
    let tenants;

    if (req.user.role === 'tenant-admin') {
      // Tenant-admins see only their created tenants
      tenants = await Tenant.find({ createdBy: req.user.email });
      logger.info(`Tenants fetched by Tenant Admin: ${req.user.email}`);
    } else {
      // Admins/super-admins see all tenants
      tenants = await Tenant.find();
      logger.info(`All tenants fetched by Admin`);
    }

    res.status(200).json(tenants);
  } catch (error) {
    logger.error(`Error fetching tenants: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const validateTenantByName = async (req, res) => {
  const { tenantName } = req.body;

  if (!tenantName) {
    logger?.warn("Tenant validation failed: Missing tenant name");
    return res.status(400).json({ message: "Tenant name is required" });
  }

  try {
    const tenant = await Tenant.findOne({ tenantName });

    if (!tenant) {
      logger?.warn(`Tenant validation failed: Tenant '${tenantName}' not found`);
      return res.status(404).json({ message: "Invalid tenant name" });
    }

    logger?.info(`Tenant Validation Success - Name: ${tenantName}`);
    res.status(200).json({
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
    });
  } catch (err) {
    logger?.error(`Error during tenant validation: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      tenantName: req.body.tenantName,
      tenantId: req.body.tenantId,
    };

    const updatedTenant = await Tenant.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true, // still enforces schema rules, but only for the updated fields
    });

    if (!updatedTenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.status(200).json({ message: "Tenant updated successfully", tenant: updatedTenant });
  } catch (error) {
    console.error("Error updating tenant:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
