import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { AuthProvider } from "./AuthContext";

// Layout / guards
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

// Pages
import Login from "./Login";
import Todo from "./Todo";
import Profile from "./Profile";

import Register from "./Register";
import ForgotPassword from "./ForgotPassword";


function App() {
  return (
    // AuthProvider is outside the router so auth state is available to every route
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ----- Public routes ----- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ----- Protected routes (must be logged in) ----- */}
          {/* ProtectedRoute guards everything nested inside, and AppLayout
              provides the shared page frame (nav, etc.) for these pages */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          >
            <Route path="/" element={<Todo />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;