import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import cors from "cors";
import { Producer, Consumer } from "./src/lib/kafka-sim.js";

const PORT = 3000;
const JWT_SECRET = "geostream-secret-2026";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(cors());
  app.use(express.json());

  // Kafka Initialization
  const locationProducer = new Producer();
  const broadcastConsumer = new Consumer("socket-broadcaster-group");
  const persistenceConsumer = new Consumer("db-persistence-group");

  // Topic: location-updates
  const TOPIC_LOCATION = "location-updates";

  // System Setup: Consumers
  // Group 1: Broadcaster (Real-time updates to others)
  broadcastConsumer.subscribe(TOPIC_LOCATION, (data) => {
    // Broadcast to all connected clients except the sender if we had the sender's socket id
    // For simplicity here, we broadcast to everyone, and frontend handles its own position
    io.emit("location:update", data);
  });

  // Group 2: Persistence Simulation
  persistenceConsumer.subscribe(TOPIC_LOCATION, (data) => {
    console.log(`[DB Persistence] Storing location for user ${data.userId} at ${data.lat}, ${data.lng}`);
    // Here you would normally perform a DB write
  });

  // Auth Routes (Mock OIDC)
  app.post("/api/auth/login", (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });
    
    // In a real app, this would be a Google/GitHub OAuth callback
    const user = { id: `user_${username.toLowerCase().replace(/\s+/g, '_')}`, name: username };
    const token = jwt.sign(user, JWT_SECRET);
    res.json({ token, user });
  });

  // Socket Middleware for Auth
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.name} (${socket.id})`);

    socket.on("location:send", async (coords) => {
      // Validate data
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        return;
      }

      // Publish to Kafka
      await locationProducer.send(TOPIC_LOCATION, {
        userId: user.id,
        userName: user.name,
        lat: coords.lat,
        lng: coords.lng,
        timestamp: Date.now()
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.name}`);
      // Notify others of disconnect if we wanted to remove them immediately
      io.emit("user:disconnected", user.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
