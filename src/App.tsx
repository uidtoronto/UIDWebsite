import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { AuthProvider } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Works from './pages/Works';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Membership from './pages/Membership';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import Dashboard from './pages/Dashboard';
import AuthGuard from './components/auth/AuthGuard';
import ExecGuard from './components/auth/ExecGuard';
import ExecLayout from './components/exec/ExecLayout';

// Exec Pages
import ExecHome from './pages/exec/ExecHome';
import ExecCRM from './pages/exec/ExecCRM';
import ExecCalendar from './pages/exec/ExecCalendar';
import ExecPrograms from './pages/exec/ExecPrograms';
import ExecMeetings from './pages/exec/ExecMeetings';
import ExecTasks from './pages/exec/ExecTasks';
import ExecMessages from './pages/exec/ExecMessages';
import ExecDocuments from './pages/exec/ExecDocuments';
import ExecFinance from './pages/exec/ExecFinance';
import ExecAnalytics from './pages/exec/ExecAnalytics';
import ExecNotifications from './pages/exec/ExecNotifications';
import ExecCalls from './pages/exec/ExecCalls';
import ExecVolunteers from './pages/exec/ExecVolunteers';
import ExecRSVP from './pages/exec/ExecRSVP';
import ExecMedia from './pages/exec/ExecMedia';
import ExecSettings from './pages/exec/ExecSettings';

function ExecDashboardRoutes() {
  return (
    <ExecGuard>
      <ExecLayout>
        <Routes>
          <Route index element={<ExecHome />} />
          <Route path="crm" element={<ExecCRM />} />
          <Route path="calendar" element={<ExecCalendar />} />
          <Route path="programs" element={<ExecPrograms />} />
          <Route path="meetings" element={<ExecMeetings />} />
          <Route path="tasks" element={<ExecTasks />} />
          <Route path="messages" element={<ExecMessages />} />
          <Route path="documents" element={<ExecDocuments />} />
          <Route path="finance" element={<ExecFinance />} />
          <Route path="analytics" element={<ExecAnalytics />} />
          <Route path="notifications" element={<ExecNotifications />} />
          <Route path="calls" element={<ExecCalls />} />
          <Route path="volunteers" element={<ExecVolunteers />} />
          <Route path="rsvp" element={<ExecRSVP />} />
          <Route path="media" element={<ExecMedia />} />
          <Route path="settings" element={<ExecSettings />} />
        </Routes>
      </ExecLayout>
    </ExecGuard>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<><Navbar /><Home /></>} />
      <Route path="/works" element={<Works />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/membership" element={<Membership />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-cancelled" element={<PaymentCancelled />} />
      <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="/exec/*" element={<AuthGuard><ExecDashboardRoutes /></AuthGuard>} />
    </Routes>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const handleDone = useCallback(() => setLoaded(true), []);

  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          {!loaded && <LoadingScreen onDone={handleDone} />}
          <div style={{ visibility: loaded ? 'visible' : 'hidden' }}>
            <AppRoutes />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
