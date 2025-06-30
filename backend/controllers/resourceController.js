//controllers/resourceController.js

import mongoose from 'mongoose';
import Resource from "../models/Resource.js";
import Tenant from '../models/Tenant.js';
import logger from '../utils/logger.js';

export const createResource = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);
    const { name, type, provider, region, cost, status, cpu, processor, memory, tenantId } = req.body;

    // Validate required fields
    if (!name || !type || !provider || !region || !cost || !tenantId) {
      logger.warn("Resource creation failed: Missing required fields");
      return res.status(400).json({ message: "All fields including tenantId are required" });
    }

    // Create new resource for selected tenant
    const newResource = new Resource({
      name,
      type,
      provider,
      region,
      cost,
      status: status || "Active",
      cpu: cpu || "N/A",
      processor: processor || "N/A",
      memory: memory || "N/A",
      tenantId,               // ✅ Use selected tenantId (not the tenant-admin's own)
      createdBy: req.user.id,
      terminatedAt: status === "Terminated" ? new Date() : null // ✅ Track who created the resource
    });

    await newResource.save();
    logger.info(`Resource Created by TenantAdmin ${req.user.id} for Tenant ${tenantId} - Resource Name: ${name}`);
    res.status(201).json({ message: "Resource created successfully", resource: newResource });

  } catch (error) {
    logger.error(`Create Resource Error: ${error.message}`);
    console.error("Create Resource Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
  
};

export const getResources = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role !== "tenant-admin") {
      logger.warn(`Unauthorized resource access attempt by user ${id}`);
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("Fetching resources created by tenant-admin:", id);

    // Fetch resources created by this tenant-admin
    const resources = await Resource.find({ createdBy: id });

    // Manually join tenant info using UUID-based tenantId
    const formattedResources = await Promise.all(
      resources.map(async (resource) => {
        const tenant = await Tenant.findOne({ tenantId: resource.tenantId }); // ← This works

        return {
          ...resource.toObject(),
          tenantName: tenant?.tenantName || "Unknown Tenant",
          tenantUUID: resource.tenantId, // UUID string
        };
      })
    );
    logger.info(`Resources Viewed by TenantAdmin ${id}`);
    res.status(200).json(formattedResources);
  } catch (err) {
    logger.error(`Error fetching resources: ${err.message}`);
    console.error("Error fetching resources:", err);
    res.status(500).json({ message: "Error fetching resources" });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, provider, cost, status, cpu, memory } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`Update failed: Invalid resource ID format (${id})`);
      return res.status(400).json({ message: "Invalid resource ID format" });
    }

    // ✅ Find the resource by ID and ensure it was created by this tenant-admin
    const resource = await Resource.findOne({ _id: id, createdBy: req.user.id });

    if (!resource) {
      logger.warn(`Update failed: Resource ${id} not found or unauthorized`);
      return res.status(404).json({ message: "Resource not found or unauthorized" });
    }

    // Update fields if present
    resource.name = name ?? resource.name;
    resource.provider = provider ?? resource.provider;
    resource.cost = cost ?? resource.cost;
    resource.status = status ?? resource.status;
    resource.cpu = cpu ?? resource.cpu;
    resource.memory = memory ?? resource.memory;

    if (originalStatus !== "Terminated" && status === "Terminated") {
      resource.terminatedAt = new Date();
    } else if (originalStatus === "Terminated" && status !== "Terminated") {
      resource.terminatedAt = null;
    }
    
    await resource.save();
    logger.info(`Resource Updated - ID: ${id}, Updated by: ${req.user.id}`);
    res.status(200).json({ message: "Resource updated successfully", resource });

  } catch (error) {
    logger.error(`Update Resource Error: ${error.message}`);
    console.error("Update Resource Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
  
};



// Delete Resource
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`Delete failed: Invalid resource ID format (${id})`);
      return res.status(400).json({ message: "Invalid resource ID format" });
    }

    // ✅ Only delete if the tenant-admin was the creator
    const resource = await Resource.findOneAndDelete({ _id: id, createdBy: req.user.id });

    if (!resource) {
      logger.warn(`Delete failed: Resource ${id} not found or unauthorized`);
      return res.status(404).json({ message: "Resource not found or unauthorized" });
    }
    logger.info(`Resource Deleted - ID: ${id}, Deleted by: ${req.user.id}`);
    res.status(200).json({ message: "Resource deleted successfully" });

  } catch (error) {
    console.error("Delete Resource Error:", error);
    logger.error(`Delete Resource Error: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
  
};

export const getUserResources = async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      logger.warn("getUserResources failed: Missing tenantId");
      return res.status(400).json({ error: "Missing tenantId" });
    }

    // Find all resources tied to this tenant UUID
    const resources = await Resource.find({ tenantId });

    // Optionally fetch tenant name for display
    const tenant = await Tenant.findOne({ tenantId });

    const formattedResources = resources.map(resource => ({
      ...resource.toObject(),
      tenantName: tenant?.tenantName || "Unknown Tenant",
      tenantUUID: tenantId,
    }));
    logger.info(`Resources Viewed for TenantId ${tenantId} by User ${req.user?.id || "Anonymous"}`);
    return res.status(200).json(formattedResources);
    
  } catch (error) {
    logger.error(`getUserResources Error: ${error.message}`);
    console.error("Error fetching resources:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
  
};

export const ViewResources=async(req,res)=>{
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

