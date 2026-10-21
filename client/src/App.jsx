import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { AuthProvider } from "./AuthContext";

// Layout / guards
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

// Pages
import Login from "./Login";
import Todo from "./Todo";
import Profile from "./Profile";

import Register from "./register";
import ForgotPassword from "./ForgotPassword";

import OwnedList from "./OwnedList";
import SharedList from "./SharedList";
import CollabTodo from "./CollabTodo";
import ListGuard from "./components/ListGuard";



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ----- Public routes ----- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ----- Protected routes (must be logged in) ----- */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >

            //children of AppLayout
            <Route path="/" element={<Todo />} />
            <Route path="/profile" element={<Profile />} />


            <Route path="/collab/owned"  element={<OwnedList />} />
            <Route path="/collab/shared" element={<SharedList />} />
            <Route path="/lists/:listId" element={<ListGuard><CollabTodo /></ListGuard>} />



          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;