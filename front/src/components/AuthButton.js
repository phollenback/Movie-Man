import React from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import '../styles/AuthButton.css';

function UserIcon() {
  return (
    <svg className="auth-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function AuthButton() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = accounts[0];

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => console.error(e));
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  if (isAuthenticated) {
    return (
      <div className="auth-signed-in">
        <span className="auth-user" title={account?.username || account?.name || ''}>
          <UserIcon />
          <span className="auth-user-name">{account?.name || account?.username || 'Signed in'}</span>
        </span>
        <button type="button" className="auth-button" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="auth-button auth-button-primary" onClick={handleLogin}>
      Sign in with Microsoft
    </button>
  );
}

export default AuthButton;
