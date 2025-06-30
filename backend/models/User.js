
//models/User.js

import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["super-admin", "tenant-admin", "viewer", "editor","user"] },
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: function(){return this.provider !=="google" && !['super-admin',"tenant-admin"];}}, 
  //role: { type: String, enum: ["admin", "user", "tenant"], required: true }, 
  provider: { type: String, default: "local" }, // Can be "google" or "local"
  providerId: { type: String },
});

const User = mongoose.model("User", userSchema);
export default User;
