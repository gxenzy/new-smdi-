import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
} from '@mui/material';
import EnergyAuditTables from './EnergyAuditTables';
import EnergyAuditTesting from './EnergyAuditTesting';
import EnergyAuditWizard from './EnergyAuditWizard';
import EnergyAuditAnalytics from './EnergyAuditAnalytics';
import { EnergyAuditProvider } from './EnergyAuditContext';
import { UserProvider } from '../../contexts/UserContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import NotificationBell from './NotificationBell';
import { ScheduleProvider } from './EnergyAuditScheduleContext';
import EnergyAuditSchedule from './EnergyAuditSchedule';
import UserTeamManagement from './UserTeamManagement';
import EnergyAuditCalendar from './EnergyAuditCalendar';
import MyTasksDashboard from './MyTasksDashboard';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`energy-audit-tabpanel-${index}`}
            aria-labelledby={`energy-audit-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}

const EnergyAudit = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <UserProvider>
            <NotificationProvider>
                <ScheduleProvider>
                    <EnergyAuditProvider>
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h4" gutterBottom>Energy Audit</Typography>
                                <NotificationBell />
                            </Box>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                <Tabs value={tabValue} onChange={handleTabChange}>
                                    <Tab label="Audit Tables" />
                                    <Tab label="Testing" />
                                    <Tab label="Advanced Audit Wizard" />
                                    <Tab label="Analytics" />
                                    <Tab label="Schedule" />
                                    <Tab label="Calendar" />
                                    <Tab label="User & Team Management" />
                                    <Tab label="My Tasks" />
                                </Tabs>
                            </Box>
                            <TabPanel value={tabValue} index={0}>
                                <EnergyAuditTables />
                            </TabPanel>
                            <TabPanel value={tabValue} index={1}>
                                <EnergyAuditTesting />
                            </TabPanel>
                            <TabPanel value={tabValue} index={2}>
                                <EnergyAuditWizard />
                            </TabPanel>
                            <TabPanel value={tabValue} index={3}>
                                <EnergyAuditAnalytics />
                            </TabPanel>
                            <TabPanel value={tabValue} index={4}>
                                <EnergyAuditSchedule />
                            </TabPanel>
                            <TabPanel value={tabValue} index={5}>
                                <EnergyAuditCalendar />
                            </TabPanel>
                            <TabPanel value={tabValue} index={6}>
                                <UserTeamManagement />
                            </TabPanel>
                            <TabPanel value={tabValue} index={7}>
                                <MyTasksDashboard />
                            </TabPanel>
                        </Box>
                    </EnergyAuditProvider>
                </ScheduleProvider>
            </NotificationProvider>
        </UserProvider>
    );
};

export default EnergyAudit;
