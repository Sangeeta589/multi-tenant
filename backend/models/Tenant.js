//models/Tenant.js

import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  tenantName: { type: String, required: true },
  tenantId: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

const Tenant = mongoose.model("Tenant", tenantSchema);
export default Tenant; // ✅ ES module export
