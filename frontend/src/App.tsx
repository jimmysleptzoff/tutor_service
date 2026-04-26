import "./App.css";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import AdminOpsPage from "./pages/AdminOpsPage";
import LandingPage from "./pages/LandingPage";
import StudentBookingPage from "./pages/StudentBookingPage";
import TutorDashboardPage from "./pages/TutorDashboardPage";
import type { DemoRole } from "./types/scheduling";

const roleToPath: Record<DemoRole, string> = {
  student: "/student",
  tutor: "/tutor",
  admin: "/admin",
};

const pathToRole: Record<string, DemoRole> = {
  "/student": "student",
  "/tutor": "tutor",
  "/admin": "admin",
};

function App() {
  const [role, setRole] = useState<DemoRole>("student");
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the dropdown role in sync when someone navigates directly by URL/tab.
  useEffect(() => {
    const routeRole = pathToRole[location.pathname];
    if (routeRole && routeRole !== role) {
      setRole(routeRole);
    }
  }, [location.pathname, role]);

  // When the role changes from the header, jump to that role's page right away.
  function handleRoleChange(nextRole: DemoRole) {
    setRole(nextRole);
    const nextPath = roleToPath[nextRole];
    if (location.pathname !== nextPath) {
      navigate(nextPath);
    }
  }

  return (
    <AppLayout role={role} setRole={handleRoleChange}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student" element={<StudentBookingPage />} />
        <Route path="/tutor" element={<TutorDashboardPage />} />
        <Route path="/admin" element={<AdminOpsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
