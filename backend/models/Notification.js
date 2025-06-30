import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: false }, 
  recipientType: { type: String, enum: ['admin', 'user','tenant-admin'], required: true },
  message: { type: String, required: true },
  incidentId: { type: String, required: false },
  requestId:{type:String, required:false},
  note: { type: Object, required: false },
  recipientEmail: String,
   status: { type: String, enum: ['unread', 'read'], default: 'unread' },
}, { timestamps: true }); 

export default mongoose.model('Notification', notificationSchema);
