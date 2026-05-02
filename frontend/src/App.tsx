import "./App.css";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import AdminOpsPage from "./pages/AdminOpsPage";
import LandingPage from "./pages/LandingPage";
import StudentBookingPage from "./pages/StudentBookingPage";
import TutorDashboardPage from "./pages/TutorDashboardPage";
import type { DemoAlert, DemoRole, DemoScenario } from "./types/scheduling";

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

const scenarioAlerts: Record<DemoScenario, DemoAlert[]> = {
  normal: [
    { id: "a1", level: "info", message: "Booking flow latency is stable under 1 second." },
    { id: "a2", level: "success", message: "No conflicts detected across current session windows." },
    { id: "a3", level: "warning", message: "CHEM115 queue is trending upward for tomorrow." },
  ],
  finals: [
    { id: "a4", level: "warning", message: "Finals week demand spike: 42% more booking attempts." },
    { id: "a5", level: "warning", message: "MATH155 waitlist crossed escalation threshold." },
    { id: "a6", level: "success", message: "Auto-assignment reroutes saved 11 at-risk sessions." },
  ],
  tutor_shortage: [
    { id: "a7", level: "danger", message: "Two tutors marked unavailable in the next 24 hours." },
    { id: "a8", level: "warning", message: "CS110 utilization at 96%, backup coverage recommended." },
    { id: "a9", level: "success", message: "Priority queue policy reduced expected churn by 18%." },
  ],
};

function App() {
  const [role, setRole] = useState<DemoRole>("student");
  const [scenario, setScenario] = useState<DemoScenario>("normal");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const routeRole = pathToRole[location.pathname];
    if (routeRole && routeRole !== role) {
      setRole(routeRole);
    }
  }, [location.pathname, role]);

  function handleRoleChange(nextRole: DemoRole) {
    setRole(nextRole);
    const nextPath = roleToPath[nextRole];
    if (location.pathname !== nextPath) {
      navigate(nextPath);
    }
  }

  return (
    <AppLayout
      role={role}
      setRole={handleRoleChange}
      scenario={scenario}
      setScenario={setScenario}
      alerts={scenarioAlerts[scenario]}
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* remove scenario */}
        <Route
  path="/student"
  element={<StudentBookingPage scenario={scenario} />}
/>

        <Route path="/tutor" element={<TutorDashboardPage />} />
        <Route path="/admin" element={<AdminOpsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}


export default App;