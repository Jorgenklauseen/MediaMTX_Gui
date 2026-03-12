import { useUsers } from '../hooks/useUsers';

function Users() {
    const { users, loading, error, banUser, unbanUser } = useUsers();

    if (loading) return <div>Laster...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Brukere ({users.length})</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }}>Navn</th>
                        <th style={{ padding: '0.5rem' }}>Brukernavn</th>
                        <th style={{ padding: '0.5rem' }}>E-post</th>
                        <th style={{ padding: '0.5rem' }}>Sist innlogget</th>
                        <th style={{ padding: '0.5rem' }}>Opprettet</th>
                        <th style={{ padding: '0.5rem' }}>Rolle</th>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                        <th style={{ padding: '0.5rem' }}>Handling</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.5rem' }}>{user.name}</td>
                            <td style={{ padding: '0.5rem' }}>{user.username}</td>
                            <td style={{ padding: '0.5rem' }}>{user.email}</td>
                            <td style={{ padding: '0.5rem' }}>
                                {user.lastLogin
                                    ? new Date(user.lastLogin).toLocaleString('nb-NO')
                                    : 'Aldri'}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                {new Date(user.createdAt).toLocaleString('nb-NO')}
                            </td>
                            <td style={{ padding: '0.5rem' }}>{user.role}</td>
                            <td style={{ padding: '0.5rem' }}>
                                {user.isBanned ? '🚫 Bannet' : '✅ Aktiv'}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                {user.isBanned ? (
                                    <button onClick={() => unbanUser(user.id)}>
                                        Unban
                                    </button>
                                ) : (
                                    <button onClick={() => banUser(user.id)} style={{ color: 'red' }}>
                                        Ban
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Users;