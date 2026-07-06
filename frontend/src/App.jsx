import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import BoardsListPage from "./pages/BoardsListPage";
import BoardPage from "./pages/BoardPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullscreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function FullscreenLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-ink text-mist font-body">
      <div className="flex items-center gap-3">
        <span className="pulse-dot" />
        Loading Pulse…
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <BoardsListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/boards/:boardId"
        element={
          <PrivateRoute>
            <BoardPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
