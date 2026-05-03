import { Users, Wifi, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface UserLocation {
  userId: string;
  userName: string;
  lat: number;
  lng: number;
  timestamp: number;
}

interface UserListProps {
  users: Map<string, UserLocation>;
  currentUser: { id: string; name: string } | null;
}

export default function UserList({ users, currentUser }: UserListProps) {
  const sortedUsers = Array.from(users.values()).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-indigo-600" />
        <h3 className="text-xs font-black uppercase text-indigo-900 tracking-widest">Active Stream Nodes</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {currentUser && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="neo-brutal glass-card p-4 relative overflow-hidden group border-indigo-500 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase bg-indigo-500 text-white px-2 py-0.5 rounded-full">Self</span>
              <Wifi className="w-3 h-3 text-green-500 animate-pulse" />
            </div>
            <p className="font-bold text-indigo-900">{currentUser.name}</p>
            <p className="text-[9px] font-mono text-indigo-400 mt-1 uppercase">Local Node Active</p>
          </motion.div>
        )}

        {sortedUsers.map((u) => {
          const isStale = Date.now() - u.timestamp > 15000;
          return (
            <motion.div
              key={u.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`neo-brutal glass-card p-4 transition-all ${isStale ? 'opacity-60' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Remote</span>
                <Clock className={`w-3 h-3 ${isStale ? 'text-orange-400' : 'text-indigo-400'}`} />
              </div>
              <p className="font-bold text-indigo-900">{u.userName}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] font-mono text-indigo-400 uppercase">
                  {u.lat.toFixed(4)}, {u.lng.toFixed(4)}
                </span>
                <span className="text-[8px] font-black text-indigo-300 uppercase">
                  {Math.floor((Date.now() - u.timestamp) / 1000)}s ago
                </span>
              </div>
            </motion.div>
          );
        })}

        {sortedUsers.length === 0 && (
          <div className="text-center py-10 opacity-30 italic text-xs">
            No other remote nodes detected in stream...
          </div>
        )}
      </div>
    </div>
  );
}
