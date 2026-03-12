import { useEffect, useState } from 'react';

type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    createdAt: string;
    lastLogin: string | null;
    isBanned: boolean;
    role: string;
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

    const banUser = async (id: number) => {
        await fetch(`/api/users/${id}/ban`, { method: 'POST' });
        setUsers(users.map(u => u.id === id ? { ...u, isBanned: true } : u));
    };

    const unbanUser = async (id: number) => {
        await fetch(`/api/users/${id}/unban`, { method: 'POST' });
        setUsers(users.map(u => u.id === id ? { ...u, isBanned: false } : u));
    };

    return { users, loading, error, banUser, unbanUser };
}