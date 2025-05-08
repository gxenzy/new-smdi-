import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  userRole: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canSign: boolean;
    canExport: boolean;
    canManageBenchmarks: boolean;
  };
}

const RoleBasedAccessControl: React.FC<Props> = ({ userRole, permissions }) => {
  const permissionsList = [
    { key: 'canEdit', label: 'Edit Reports' },
    { key: 'canDelete', label: 'Delete Reports' },
    { key: 'canSign', label: 'Sign Reports' },
    { key: 'canExport', label: 'Export Reports' },
    { key: 'canManageBenchmarks', label: 'Manage Benchmarks' },
  ] as const;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Role Permissions
          </Typography>
          <Chip
            label={userRole.toUpperCase()}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
        <List>
          {permissionsList.map(({ key, label }) => (
            <ListItem key={key}>
              <ListItemIcon>
                {permissions[key] ? (
                  <CheckIcon color="success" />
                ) : (
                  <CloseIcon color="error" />
                )}
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RoleBasedAccessControl; 