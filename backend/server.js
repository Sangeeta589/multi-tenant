//server.js


import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http"; // NEW: for creating server
import { Server as SocketIOServer } from "socket.io"; // NEW: for socket support
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath
import { dirname } from "path"; // Import dirname

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import tenantdashboardRoutes from "./routes/tenantdashboardRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import notificationRoutes from './routes/notificationRoutes.js';


dotenv.config();
console.log("jwt",process.env.JWT_SECRET);
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


app.use(
    session({
      secret: process.env.SESSION_SECRET || "b1f3a9d7c5e2g8h4j6k0m2n5p7q9r3s" , // Use a strong secret key
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // Set to `true` if using HTTPS
    })
  );


app.use("/api/auth", authRoutes);
app.use("/auth",authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tenant-dashboard",tenantdashboardRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/incidents",incidentRoutes);
app.use('/api/notifications', notificationRoutes);

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  // Logic to create a regular user
  // ...
  res.status(201).send("User  registered successfully.");
});

app.post("/api/auth/register-admin", (req, res) => {
  const { name, email, password } = req.body;
  // Logic to create an admin user
  // ...
  res.status(201).send("Admin registered successfully.");
});

// Utility to get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});


const server = http.createServer(app); // 👈 Create HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000", // Or restrict to your frontend domain
    methods: ["GET", "POST"],
  },
});



// Socket.IO logic
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join_room", (email) => {
    socket.join(email);
    console.log(`${email} joined their personal room`);
  });

  socket.on("send_message", (data) => {
    const { sender, receiver } = data;
    io.to(receiver).emit("receive_message", data);
    io.to(sender).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
// ==============================
// ✅ Start the Server
// ==============================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
