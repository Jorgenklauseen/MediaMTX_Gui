import type React from 'react';
import {useAuth} from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();

    if (isAuthenticated === null || loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/api/users/login?returnUrl=${returnUrl}`;
        return null;
    }

    return <>{children}</>;
}

export function AdminRoute({ children }: {children: React.ReactNode}) {
    const { user } = useAuth();
    if (user?.role !== 'admin') return <Navigate to="/" />;
    return <>{children}</>
}