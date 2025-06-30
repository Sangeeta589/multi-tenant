//controllers/serviceController.js

import Service from "../models/Service.js";

export const createService = async (req, res) => {
  try {
    const { title, category, icon } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required." });
    }

    const existing = await Service.findOne({ title, category });
    if (existing) {
      return res.status(409).json({ error: "Service already exists." });
    }

    const newService = new Service({ title, category, icon });
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    console.error("Create service error:", err);
    res.status(500).json({ error: "Failed to create service." });
  }
};

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};


export const getServiceByCategory = async (req, res) => {
    try {
      const service = await Service.findOne({ category: req.query.category });
      if (!service) return res.status(404).json({ error: "Service not found" });
      res.json(service);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  };
  