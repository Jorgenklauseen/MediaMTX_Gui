import {useAuth} from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();

    if (isAuthenticated === null || loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        window.location.href = "/api/users/login";
        return null;
    }

    return <>{children}</>;
}