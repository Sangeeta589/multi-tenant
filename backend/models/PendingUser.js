//models/PendingUser.js

import mongoose from 'mongoose';

const PendingRegistrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum:['user'] ,default:'user'},
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});


const PendingRegistration = mongoose.model("PendingRegistration", PendingRegistrationSchema);
export default PendingRegistration;
