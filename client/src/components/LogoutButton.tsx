import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';

const LogoutButton: React.FC = () => {
  const { logout } = useAuthContext();
  return <button onClick={logout}>Logout</button>;
};

export default LogoutButton; 