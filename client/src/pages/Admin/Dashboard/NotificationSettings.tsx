import React from 'react';
import { Box, Card, CardContent, Typography, Switch, FormGroup, FormControlLabel } from '@mui/material';

const NotificationSettings: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <Box sx={{ mt: 2 }}>
          <FormGroup>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Email Notifications"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Push Notifications"
            />
            <FormControlLabel
              control={<Switch />}
              label="SMS Notifications"
            />
          </FormGroup>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings; 