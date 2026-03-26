import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import AvailabilityPage from './pages/AvailabilityPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudyPlanPage from './pages/StudyPlanPage';
import SubjectsPage from './pages/SubjectsPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import { usePlanner } from './context/PlannerContext';

const ProtectedRoute = ({ children }) => {
  const { token } = usePlanner();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const location = useLocation();
  const { token } = usePlanner();

  return (
    <>
      {token && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Default Route redirects to Login if unauthenticated or Dashboard if authenticated */}
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><SubjectsPage /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/availability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
          <Route path="/plan" element={<ProtectedRoute><StudyPlanPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default App;
