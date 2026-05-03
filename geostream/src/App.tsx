/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { LogIn, Map as MapIcon, Users, Activity, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import LiveMap from './components/LiveMap';
import Login from './components/Login';
import UserList from './components/UserList';

interface User {
  id: string;
  name: string;
}

interface UserLocation {
  userId: string;
  userName: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [otherUsers, setOtherUsers] = useState<Map<string, UserLocation>>(new Map());
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('geo_token');
    const savedUser = localStorage.getItem('geo_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    if (!token || !user) return;

    socketRef.current = io({
      auth: { token },
      transports: ['websocket']
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to GeoStream via Socket.IO');
      setError(null);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError('Connection fail: ' + err.message);
    });

    socketRef.current.on('location:update', (data: UserLocation) => {
      if (data.userId !== user.id) {
        setOtherUsers((prev) => {
          const next = new Map(prev);
          next.set(data.userId, data);
          return next;
        });
      }
    });

    socketRef.current.on('user:disconnected', (userId: string) => {
      setOtherUsers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, user]);

  // Geolocation Tracking
  useEffect(() => {
    if (!user) return;

    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMyPosition([latitude, longitude]);

        if (socketRef.current?.connected) {
          socketRef.current.emit('location:send', {
            lat: latitude,
            lng: longitude
          });
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(`Location Error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);

  // Stale users cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOtherUsers((prev) => {
        let changed = false;
        const next = new Map(prev);
        next.forEach((val: UserLocation, key: string) => {
          if (now - val.timestamp > 60000) {
            next.delete(key);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('geo_token', newToken);
    localStorage.setItem('geo_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setOtherUsers(new Map());
    setMyPosition(null);
    localStorage.removeItem('geo_token');
    localStorage.removeItem('geo_user');
  };

  return (
    <div className="min-h-screen bg-[#E0E7FF] text-[#1D1D1F] font-sans p-6">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex items-center justify-center min-h-[calc(100vh-3rem)]"
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-[calc(100vh-3rem)] gap-6"
          >
            {/* Header / Nav */}
            <header className="clay-card px-8 h-20 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 flex items-center justify-center rounded-2xl shadow-lg">
                  <Activity className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-black text-2xl tracking-tighter uppercase leading-none text-indigo-900">GeoStream</h1>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Live Event Node</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Operator</span>
                  <span className="text-sm font-bold text-indigo-900">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="clay-button bg-white text-indigo-600 hover:text-red-500 w-12 h-12 p-0 scale-90"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
              {/* Sidebar */}
              <aside className="w-full md:w-80 flex flex-col gap-6 hidden md:flex shrink-0 overflow-hidden">
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                  <section className="clay-card p-6 h-1/3 overflow-y-auto">
                    <h3 className="text-xs font-black uppercase text-indigo-300 mb-4 tracking-[0.2em]">Telemetry</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black text-indigo-900 opacity-40">System Link</span>
                        <div className="flex items-center gap-2">
                          <span className={`${error ? 'bg-red-400' : 'bg-green-400'} w-2.5 h-2.5 rounded-full shadow-lg`}></span>
                          <span className="text-xs font-bold text-indigo-900 uppercase">
                            {error ? 'Protocol_Error' : 'Link_Established'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black text-indigo-900 opacity-40">Packet Flux</span>
                        <div className="text-xs font-bold text-indigo-900">342.2 KPBS</div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="flex-1 clay-card p-6 min-h-0">
                    <UserList users={otherUsers} currentUser={user} />
                  </section>
                </div>
              </aside>

              {/* Map Section */}
              <section className="flex-1 clay-card p-2 bg-indigo-50 border-4 border-white relative min-h-0">
                <LiveMap 
                  user={user} 
                  otherUsers={otherUsers} 
                  myPosition={myPosition} 
                  error={error} 
                />
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

