import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  return (
    <header className="h-14 border-b border-white/5 bg-panel flex items-center justify-between px-5 flex-shrink-0">
      <Link to="/" className="flex items-center gap-2">
        <span className="pulse-dot" />
        <span className="font-display font-bold text-lg tracking-tight">Pulse</span>
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-mist">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
          {connected ? "Live" : "Reconnecting…"}
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: user.avatarColor }}
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button onClick={logout} className="text-xs text-mist hover:text-white transition">
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
