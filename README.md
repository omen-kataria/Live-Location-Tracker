# Live Location Tracker

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![WebSockets](https://img.shields.io/badge/WebSockets-Real--Time-blue)
![Map](https://img.shields.io/badge/Maps-Location--Tracking-orange)
![Status](https://img.shields.io/badge/Status-Active-success)

A real-time location tracking web application that allows users to share and monitor live positions on a map with instant updates across all connected clients.

---

##  Preview

https://github.com/user-attachments/assets/a6d1af87-eb35-4ad6-8e3f-219861ef6cbb

---

##  Overview

The **Live Location Tracker** is designed to demonstrate how real-time systems work using location data.

It enables users to:

- Share live location  
- Track multiple users simultaneously  
- View movement updates in real time  

This project focuses on **low-latency communication**, **efficient updates**, and **scalable architecture**.

---

##  Features

-  Real-time location tracking  
-  Interactive map interface  
-  Live updates using WebSockets  
-  Multi-user tracking  
-  Instant position synchronization  
-  Automatic connect/disconnect handling  
-  Refresh-safe tracking session  
-  Lightweight and fast updates  

---

##  Tech Stack

### Frontend
- HTML  
- CSS  
- JavaScript  
- Map API (Leaflet / Google Maps)

### Backend
- Node.js  
- Express  
- WebSockets (Socket.IO / WS)

### Optional Enhancements
- Redis (for scaling & Pub/Sub)  
- MongoDB / Database (for storing sessions)  

---

##  System Architecture

```

User Device (GPS)
│
▼
Frontend (Map UI)
│
▼
WebSocket Server (Node.js)
│
▼
Other Connected Clients

```id="@@@@"

---

##  How It Works

1. User opens the app and grants location permission  
2. Browser fetches GPS coordinates  
3. Location is sent to the server via WebSocket  
4. Server broadcasts the location to all connected clients  
5. Map updates markers in real time  

---

##  Project Structure

```

project-root/
├── server/
│   ├── app.js
│   ├── sockets/
│   └── utils/
├── client/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── public/
└── README.md

---

##  Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd project-folder
````

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

### 4. Open in browser

```
http://localhost:3000
```

---

##  Permissions

* Requires **location access** from the browser
* Works best on **HTTPS or localhost**

---

##  Future Improvements

* User authentication (login system)
* Private rooms / group tracking
* Route history tracking
* Geofencing alerts
* Mobile app version

---

##  Demo Checklist

*  Location permission prompt works
*  User location appears on map
*  Multiple users visible simultaneously
*  Real-time movement updates
*  Disconnect removes marker

---

##  What This Project Teaches

* Real-time communication using WebSockets
* Handling live GPS data in web apps
* Map integration and visualization
* Multi-user synchronization
* Event-driven backend architecture

---

##  Key Insight

Real-time location tracking is not just about maps — it's about:

* Efficient data streaming
* Low-latency updates
* State synchronization across clients

---

##  Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

##  License

This project is for educational purposes.
