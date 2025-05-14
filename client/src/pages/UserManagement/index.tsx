import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserList from './UserList';
import UserActivityLog from './UserActivityLog';

const UserManagement: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/activity/:userId" element={<UserActivityLog />} />
    </Routes>
  );
};

export default UserManagement;
