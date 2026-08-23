import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";

import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ExerciseDetail from "./pages/ExerciseDetail";
import Advisor from "./pages/Advisor";
import Chat from "./pages/Chat";
import AdminInsights from "./pages/admin/AdminInsights";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExercises from "./pages/admin/AdminExercises";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Navbar />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/exercises/:id" element={<ExerciseDetail />} />
            <Route path="/advisor" element={<Advisor />} />
            <Route path="/chat" element={<Chat />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin/insights" element={<AdminInsights />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/exercises" element={<AdminExercises />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
