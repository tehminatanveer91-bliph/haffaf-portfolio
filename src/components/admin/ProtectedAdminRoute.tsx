import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProtectedAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authReady, isAdmin, adminChecked } = useAuth();

  if (!authReady || !adminChecked) {
    return (
      <div className="min-h-screen bg-[#080D12] text-[#F4F7F6] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#91A39E]">
          <Loader2 className="w-4 h-4 animate-spin text-[#00D6A3]" />
          <span>Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
