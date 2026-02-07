import React from 'react';
import '../styles/Users.css';

const Users = ({ users, loading, error }) => {
  if (loading) {
    return (
      <div className="users-loading">
        <p>Loading users…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="users-error">
        <p>{error}</p>
      </div>
    );
  }
  if (!users || users.length === 0) {
    return (
      <div className="users-empty">
        <p>No users yet. Use the app to appear here.</p>
      </div>
    );
  }

  return (
    <div className="users-view">
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Last seen</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.oid}>
              <td>{u.displayName || 'Unknown'}</td>
              <td>{u.email || '—'}</td>
              <td>{u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
