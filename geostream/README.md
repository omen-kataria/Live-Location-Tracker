# GeoStream: Real-time Live Location Tracking

A high-throughput live location tracking system built with a Kafka-inspired event streaming architecture. This project demonstrates how to decouple high-frequency location updates from database persistence using event streams.

## 🚀 Tech Stack
- **Frontend**: React 19, Leaflet, Tailwind CSS, Framer Motion
- **Backend**: Express, Socket.IO
- **Event Streaming**: custom-built Kafka Simulation (Topics, Producers, Consumer Groups)
- **Authentication**: OIDC-style JWT implementation
- **Language**: TypeScript

## 🏗️ Architecture & Event Flow

### 1. Authentication Flow
- User logs in via the `/api/auth/login` endpoint (Simulated OIDC/OAuth 2.0).
- Server issues a JWT containing user identity.
- Socket.IO connection is established using the JWT for authentication.

### 2. Location Update Flow (Kafka Integration)
The system uses a decoupled event-driven architecture to handle high-throughput coordinates:

1. **Frontend**: Obtains coordinates via Geolocation API and emits `location:send` over Socket.IO.
2. **Server (Producer)**: The Socket.IO handler acts as a **Kafka Producer**, publishing the raw event to the `location-updates` topic.
3. **Kafka (System)**: The event is stored in the topic and becomes available to all registered consumers.
4. **Consumers**:
   - **Group: `socket-broadcaster-group`**: Consumes from the topic and broadcasts the update to all connected users via `io.emit`. This ensures users see each other moving in real-time.
   - **Group: `db-persistence-group`**: A separate consumer group that logs/stores coordinates. This prevents expensive database writes from blocking the real-time broadcast loop.

### 3. Benefits of this Pattern
- **Scalability**: By using Kafka-like event streams, we can add more consumers (e.g., analytics, fraud detection, caching) without modifying the ingestion logic.
- **Resilience**: Even if the database is slow, the real-time broadcast continues unaffected because they are handled by separate consumer groups.
- **Handling High Throughput**: Essential for rider/customer tracking apps like Uber or DoorDash.

## ⚙️ Setup & Environment

### Environment Variables
Create a `.env` file (see `.env.example`):
```env
# Required for any Gemini integrations (not used in core stream but available)
GEMINI_API_KEY="YOUR_KEY"
```

### Installation
1. Install dependencies: `npm install`
2. Start the dev server (includes Express + Vite): `npm run dev`

## 📡 Socket Events
- `location:send`: Client sends `{ lat, lng }`
- `location:update`: Server broadcasts `{ userId, userName, lat, lng, timestamp }`
- `user:disconnected`: Server notifies when a node leaves the mesh.

## 📝 Demo
- **Video**: [Unlisted YouTube Link Placeholder]
- **Note**: This environment provides a live preview. To test real-time tracking, open the app in two separate tabs/windows and log in as different users.

---
*Created as part of the Real-time Location Tracking Assignment.*
