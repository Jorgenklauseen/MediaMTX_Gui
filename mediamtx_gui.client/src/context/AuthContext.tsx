import { createContext, useContext, useEffect, useState } from 'react';

interface AuthUser {
    name: string;
    username: string;
    email: string;
    sub: string;
    role: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
});

export async function fetchCurrentUser(): Promise<AuthUser | null> {
    const response = await fetch("/api/users/me");

    if (!response.ok) {
        throw new Error("Could not load streams");
    }
    return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    
useEffect(() => {
    fetchCurrentUser()
        .then(data => {
            setUser(data);
            setIsAuthenticated(data !== null);
        })
        .catch(() => {
            setIsAuthenticated(false);
        })
        .finally(() => {
            setLoading(false);
        });
}, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}