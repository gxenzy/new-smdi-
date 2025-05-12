import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'auditor' | 'viewer';

interface UserRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canExport: boolean;
    canImport: boolean;
  };
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};

interface UserRoleProviderProps {
  children: ReactNode;
  initialRole?: UserRole;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({ 
  children, 
  initialRole = 'admin' 
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  
  // Define permissions based on role
  const permissions = {
    canEdit: role === 'admin' || role === 'auditor',
    canDelete: role === 'admin',
    canApprove: role === 'admin' || role === 'auditor',
    canExport: true, // All roles can export
    canImport: role === 'admin', // Only admins can import
  };
  
  return (
    <UserRoleContext.Provider value={{ role, setRole, permissions }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export default UserRoleContext; 