import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';

interface ExecGuardProps {
  children: ReactNode;
}

const EXEC_ROLES = ['admin', 'regional_president', 'executive', 'youth_branch', 'womens_branch', 'volunteer_coordinator', 'media_team', 'finance_team'];

export default function ExecGuard({ children }: ExecGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = user?.exec_role ?? 'member';
  const isExec = user?.is_exec ?? EXEC_ROLES.includes(role);

  if (!isExec) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#061E30] mb-2">Access Restricted</h2>
          <p className="text-[#3D6480] text-sm mb-6">This area is only accessible to Executive Board members and Administrators.</p>
          <a href="/dashboard" className="inline-block px-6 py-2.5 bg-[#0D4D7C] text-white text-sm font-medium rounded-xl hover:bg-[#0a3d63] transition-colors">
            Go to Member Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
