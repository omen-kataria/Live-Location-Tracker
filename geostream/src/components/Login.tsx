import React, { useState } from 'react';
import { LogIn, Github, MapPin } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { id: string; name: string }, token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await response.json();
      if (data.token) {
        onLogin(data.user, data.token);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="clay-card p-12 max-w-md w-full bg-indigo-50 border-white border-4">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-20 h-20 bg-indigo-500 flex items-center justify-center rounded-[2rem] shadow-[var(--shadow-clay-btn)] mb-6">
          <MapPin className="text-white w-10 h-10" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-indigo-900 uppercase tracking-tight">GeoStream</h2>
          <p className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest mt-1">Identity Protocol v2.0</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="username" className="block text-xs font-bold text-indigo-900 uppercase mb-3 px-2 tracking-wider">
            User Alias
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="clay-input"
            placeholder="ENTER_YOUR_TAG"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="clay-button w-full h-16 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="text-sm uppercase font-black animate-pulse">Syncing...</span>
          ) : (
            <>
              <LogIn className="w-6 h-6 mr-3" />
              <span className="text-lg font-black uppercase tracking-wider">Initialize</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-12 text-center">
        <p className="text-[9px] uppercase font-bold text-indigo-300 tracking-[0.2em] leading-relaxed">
          Secured via Event Stream Isolation
        </p>
      </div>
    </div>
  );
}
