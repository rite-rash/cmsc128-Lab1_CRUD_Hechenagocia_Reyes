import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./Login";
import Todo from "./Todo";

import Register from "./Register";
import ForgotPassword from "./ForgotPassword";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Todo />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;