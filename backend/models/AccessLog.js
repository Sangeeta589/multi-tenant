//models/AccessLog.js
import mongoose from "mongoose";

const accessLogSchema = new mongoose.Schema({
    username: String,
    email: String,
    role: String,
    tenantId: String,
    tenantName: String,
    accessedAt: { type: Date, default: Date.now },
});

export default mongoose.model("AccessLog", accessLogSchema);
