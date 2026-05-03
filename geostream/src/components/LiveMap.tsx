import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface UserLocation {
  userId: string;
  userName: string;
  lat: number;
  lng: number;
  timestamp: number;
}

interface LiveMapProps {
  user: { id: string; name: string };
  otherUsers: Map<string, UserLocation>;
  myPosition: [number, number] | null;
  error: string | null;
}

// Component to handle auto-panning or initial centring
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function LiveMap({ user, otherUsers, myPosition, error }: LiveMapProps) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden rounded-[1.5rem]">
      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] clay-card bg-red-50 text-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest border-2 border-white">
          System Critical: {error}
        </div>
      )}

      <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-4">
         <div className="clay-card p-5 bg-white/90 backdrop-blur-sm sm:w-48">
            <h4 className="text-[10px] font-black uppercase text-indigo-300 mb-2 tracking-widest">Active nodes</h4>
            <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="w-3 h-3 bg-green-500 rounded-full block"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full block absolute inset-0 animate-ping opacity-75"></span>
                </div>
                <p className="text-sm font-black text-indigo-900 tracking-tight">{otherUsers.size + (myPosition ? 1 : 0)} PARTITIONS</p>
            </div>
         </div>
      </div>

      <MapContainer
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="grayscale saturate-50 contrast-125"
        />

        {myPosition && (
          <Marker position={myPosition}>
            <Popup>
               <div className="font-sans">
                  <p className="font-bold uppercase text-xs">Self (Active Node)</p>
                  <p className="text-[10px] font-mono opacity-50 mt-1">{user.name}</p>
               </div>
            </Popup>
          </Marker>
        )}

        {Array.from(otherUsers.values()).map((u: UserLocation) => (
          <Marker key={u.userId} position={[u.lat, u.lng]}>
             <Popup>
               <div className="font-sans">
                  <p className="font-bold uppercase text-xs">Remote Entity</p>
                  <p className="text-[10px] font-mono opacity-50 mt-1">{u.userName}</p>
                  <p className="text-[9px] font-mono mt-2 uppercase tracking-tighter opacity-40">Stream Offset: {Math.floor(Math.random() * 1000)}</p>
               </div>
            </Popup>
          </Marker>
        ))}

        {myPosition && <MapController center={myPosition} />}
      </MapContainer>
    </div>
  );
}

