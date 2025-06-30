//models/Service.js

import mongoose  from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: String,
  icon: { type: String, default: "Default" }, 
});

const Service = mongoose.model("Service", serviceSchema);
export default Service;

