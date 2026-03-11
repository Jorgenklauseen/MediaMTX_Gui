import { useEffect, useState } from 'react';

type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    createdAt: string;
    lastLogin: string | null;
}

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/users')
            .then(res => {
                if (!res.ok) throw new Error('Could not load users');
                return res.json();
            })
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { users, loading, error };
}