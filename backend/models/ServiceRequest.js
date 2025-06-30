import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  ip: { type: String, required: true },
  permission: { type: Boolean, default: false },
  adminName: { type: String, required: true },
  additionalInfo: String,
  status: {
    type: String,
    enum: ['logged', 'opened', 'resolved', 'pending'],
    default: 'logged'
  },
  createdBy: String,
  createdByEmail: String,
  actionTaken: String,
  actionedBy: String,
  actionedAt: Date,
  updatedAt: Date,
  deadline: { type: Date, default: null },
  tenantId: {
  type: String,
  required: true
},
tenantName: {
  type: String,
  required: true
},

  userEmail: String,
  notes: [
    {
      text: { type: String, required: true },
      addedBy: { type: String, required: true },
      addedByEmail: { type: String, required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  publicOrPrivate: String,
  bandwidth: String,
  subnet: String,
}, { timestamps: true });

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);
export default ServiceRequest;
