import { createContext, useContext, useEffect, useState } from 'react';

interface User {
    name: string;
    username: string;
    email: string;
    sub: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/users/me")
            .then(res => {
                if (res.ok) return res.json();
                setIsAuthenticated(false);
                setLoading(false);
            })
            .then(data => {
                if (data) {
                    setUser(data);
                    setIsAuthenticated(true);
                    setLoading(false);
                }
            })
            .catch(() => {
                setIsAuthenticated(false);
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