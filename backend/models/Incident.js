//models/Incident.js
import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true },
  status: {
  type: String,
  enum: ['logged', 'opened', 'resolved','pending'],
  default: 'logged'
},
  summary: { type: String, required: true },
  description: { type: String, required: true },
  urgency: { type: String, default: 'Medium' },
  tenantId: { type: String, required: true },
  createdBy: String,
  updatedAt: Date,
  actionTaken: String,
  actionedBy: String,
  actionedAt: Date,
  tenantName: {
  type: String,
  required: true
},
  deadline: { type: Date, default: null },
  notes: [
  {
    text: { type: String, required: true },
    addedBy: { type: String, required:true },
     addedByEmail: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }
]


}, { timestamps: true },
 
);

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
