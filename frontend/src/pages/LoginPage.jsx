import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { loginUser, registerUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await loginUser(email, password);
      else await registerUser(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center font-body px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="pulse-dot" />
          <span className="font-display text-2xl font-bold tracking-tight">Pulse</span>
        </div>

        <div className="bg-panel border border-white/5 rounded-2xl shadow-card p-7">
          <h1 className="font-display text-lg font-semibold mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-mist text-sm mb-6">
            {mode === "login" ? "Sign in to sync with your team in real time." : "Start collaborating on boards instantly."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <input
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60 transition rounded-lg py-2 text-sm font-medium"
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <p className="text-mist text-xs mt-5 text-center">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="text-accent hover:underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="text-mist text-xs text-center mt-4">
          Demo seed user: ayesha@example.com / password123
        </p>
      </div>
    </div>
  );
}
