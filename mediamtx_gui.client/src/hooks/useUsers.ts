import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUsers, banUser as apiBanUser, unbanUser as apiUnbanUser } from "../api/usersApi";
import type { User } from "../types/users";

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const banUser = async (id: number) => {
        try {
            await apiBanUser(id);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: true } : u));
            toast.error("Bruker er bannet 🚫");
        } catch {
            toast.error("Kunne ikke banne bruker");
        }
    };

    const unbanUser = async (id: number) => {
        try {
            await apiUnbanUser(id);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: false } : u));
            toast.success("Bruker er unbannet ✅");
        } catch {
            toast.error("Kunne ikke unbanne bruker");
        }
    };

    return { users, loading, error, banUser, unbanUser };
}