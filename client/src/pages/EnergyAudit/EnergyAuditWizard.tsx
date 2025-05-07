import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Grid,
  Divider,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEnergyAudit, Finding } from './EnergyAuditContext';
import { useUserContext } from '../../contexts/UserContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { UserRole } from '../../types';
import FindingCard from '../../components/EnergyAudit/FindingCard';
import WorkflowAdmin from '../../components/EnergyAudit/WorkflowAdmin';
import { saveAs } from 'file-saver';

const steps = ['Lighting', 'HVAC', 'Envelope', 'Summary & Review'];

type AuditSection = 'lighting' | 'hvac' | 'envelope';
type AuditState = {
  lighting: Finding[];
  hvac: Finding[];
  envelope: Finding[];
  summary: string;
};

type NotificationType = 'info' | 'warning' | 'error' | 'success';
type ApprovalStatus = 'Draft' | 'Pending Review' | 'Manager Approval' | 'Final Approval' | 'Approved' | 'Rejected';
type FindingStatus = 'Open' | 'In Progress' | 'Resolved';
type FindingSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

const EnergyAuditWizard: React.FC = () => {
  const { audit, setAudit, workflowStages, setWorkflowStages, reminderDays, escalationDays } = useEnergyAudit();
  const { users, currentUser } = useUserContext();
  const { addNotification } = useNotificationContext();
  const [activeStep, setActiveStep] = useState(0);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [selectedFindings, setSelectedFindings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<FindingSeverity | ''>('');
  const [filterStatus, setFilterStatus] = useState<FindingStatus | ''>('');
  const [filterAssignee, setFilterAssignee] = useState('');

  // Automated reminders for pending approvals
  useEffect(() => {
    const now = new Date();
    (['lighting', 'hvac', 'envelope'] as const).forEach(section => {
      audit[section].forEach(finding => {
        if (
          ['Pending Review', 'Manager Approval', 'Final Approval'].includes(finding.approvalStatus) &&
          finding.assignee &&
          new Date(finding.createdAt).getTime() < now.getTime() - (reminderDays ?? 2) * 24 * 60 * 60 * 1000
        ) {
          addNotification({
            message: `Reminder: Finding in ${section.charAt(0).toUpperCase() + section.slice(1)} assigned to ${finding.assignee} is pending approval for more than ${reminderDays ?? 2} days!`,
            type: 'warning' as NotificationType,
          });
        }
        if (
          ['Pending Review', 'Manager Approval', 'Final Approval'].includes(finding.approvalStatus) &&
          finding.assignee &&
          new Date(finding.createdAt).getTime() < now.getTime() - (escalationDays ?? 5) * 24 * 60 * 60 * 1000
        ) {
          addNotification({
            message: `Escalation: Finding in ${section.charAt(0).toUpperCase() + section.slice(1)} assigned to ${finding.assignee} is overdue for approval by more than ${escalationDays ?? 5} days!`,
            type: 'error' as NotificationType,
          });
        }
      });
    });
  }, [audit, addNotification, reminderDays, escalationDays]);

  // Add a new finding to a section
  const addFinding = useCallback((section: AuditSection) => {
    setAudit((prev: AuditState) => ({
      ...prev,
      [section]: [
        ...prev[section],
        {
          id: Date.now().toString() + Math.random(),
          description: '',
          recommendation: '',
          createdAt: new Date().toISOString(),
          section,
          severity: 'Medium' as FindingSeverity,
          estimatedCost: 0,
          status: 'Open' as FindingStatus,
          assignee: '',
          comments: [],
          approvalStatus: 'Draft' as ApprovalStatus,
          activityLog: [{
            id: Date.now().toString() + Math.random(),
            action: 'Created',
            user: currentUser.name,
            timestamp: new Date().toISOString(),
            details: 'Finding created',
          }],
        },
      ],
    }));
    addNotification({
      message: `A new finding was added to ${section.charAt(0).toUpperCase() + section.slice(1)} by ${currentUser.name}.`,
      type: 'info' as NotificationType,
    });
  }, [currentUser.name, setAudit, addNotification]);

  // Update a finding
  const updateFinding = useCallback((
    section: AuditSection,
    id: string,
    field: keyof Omit<Finding, 'id' | 'section' | 'createdAt' | 'comments'>,
    value: FindingSeverity | FindingStatus | number | string
  ) => {
    setAudit((prev: AuditState) => {
      const prevFinding = prev[section].find(f => f.id === id);
      if (field === 'assignee' && value && value !== prevFinding?.assignee) {
        addNotification({
          message: `You have been assigned to a finding in ${section.charAt(0).toUpperCase() + section.slice(1)} by ${currentUser.name}.`,
          type: 'info' as NotificationType,
        });
      }
      if (field === 'status' && value && value !== prevFinding?.status) {
        addNotification({
          message: `Status of a finding in ${section.charAt(0).toUpperCase() + section.slice(1)} was changed to ${value} by ${currentUser.name}.`,
          type: 'info' as NotificationType,
        });
      }
      return {
        ...prev,
        [section]: prev[section].map((f) =>
          f.id === id
            ? {
                ...f,
                [field]: value,
                activityLog: [
                  ...(f.activityLog || []),
                  {
                    id: Date.now().toString() + Math.random(),
                    action: `Updated ${field}`,
                    user: currentUser.name,
                    timestamp: new Date().toISOString(),
                    details: `Changed ${field} to ${value}`,
                  },
                ],
              }
            : f
        ),
      };
    });
  }, [currentUser.name, setAudit, addNotification]);

  // Handle photo upload
  const handlePhotoUpload = useCallback((
    section: AuditSection,
    id: string,
    file: File
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAudit((prev: AuditState) => ({
        ...prev,
        [section]: prev[section].map((f) =>
          f.id === id ? { ...f, photo: base64 } : f
        ),
      }));
    };
    reader.readAsDataURL(file);
  }, [setAudit]);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Energy Audit Report', 14, 18);
    doc.setFontSize(12);
    doc.text('Summary:', 14, 30);
    doc.text(audit.summary || '-', 14, 38, { maxWidth: 180 });

    const allFindings = ([] as Finding[])
      .concat(audit.lighting, audit.hvac, audit.envelope);

    // Summary stats
    const totalFindings = allFindings.length;
    const openFindings = allFindings.filter(f => f.status === 'Open').length;
    const resolvedFindings = allFindings.filter(f => f.status === 'Resolved').length;
    const totalCost = allFindings.reduce((sum, f) => sum + (f.estimatedCost || 0), 0);
    const avgCost = totalFindings ? (totalCost / totalFindings) : 0;

    doc.text(`Total Findings: ${totalFindings}`, 14, 48);
    doc.text(`Open: ${openFindings}`, 14, 56);
    doc.text(`Resolved: ${resolvedFindings}`, 14, 64);
    doc.text(`Total Estimated Cost: ₱${totalCost.toLocaleString()}`, 14, 72);
    doc.text(`Average Cost: ₱${avgCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 14, 80);

    (doc as any).autoTable({
      head: [['Section', 'Finding', 'Recommendation', 'Severity', 'Cost (₱)', 'Status', 'Assignee', 'Comments']],
      body: allFindings.map(f => [
        f.section.charAt(0).toUpperCase() + f.section.slice(1),
        f.description,
        f.recommendation,
        f.severity,
        f.estimatedCost.toLocaleString(),
        f.status,
        f.assignee || '-',
        f.comments.map(c => `${c.author}: ${c.text}`).join('\n') || '-',
      ]),
      startY: 90,
      styles: { cellWidth: 'wrap', fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 7: { cellWidth: 40 } },
    });

    doc.save('energy_audit_report.pdf');
  };

  // Export to CSV
  const exportToCSV = () => {
    const allFindings = ([] as Finding[]).concat(audit.lighting, audit.hvac, audit.envelope);
    const headers = ['Section', 'Description', 'Recommendation', 'Severity', 'Cost', 'Status', 'Assignee', 'Approval', 'Created At'];
    const rows = allFindings.map(f => [
      f.section,
      f.description.replace(/\n/g, ' '),
      f.recommendation.replace(/\n/g, ' '),
      f.severity,
      f.estimatedCost,
      f.status,
      f.assignee || '',
      f.approvalStatus,
      f.createdAt
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'energy_audit_findings.csv');
  };

  // Export to Excel (simple xlsx)
  const exportToExcel = async () => {
    const allFindings = ([] as Finding[]).concat(audit.lighting, audit.hvac, audit.envelope);
    const headers = ['Section', 'Description', 'Recommendation', 'Severity', 'Cost', 'Status', 'Assignee', 'Approval', 'Created At'];
    const rows = allFindings.map(f => [
      f.section,
      f.description,
      f.recommendation,
      f.severity,
      f.estimatedCost,
      f.status,
      f.assignee || '',
      f.approvalStatus,
      f.createdAt
    ]);
    const xlsxRows = [headers, ...rows];
    const xlsxData = xlsxRows.map(r => r.join('\t')).join('\n');
    const blob = new Blob([xlsxData], { type: 'application/vnd.ms-excel' });
    saveAs(blob, 'energy_audit_findings.xls');
  };

  // Add a comment to a finding
  const addComment = useCallback((section: AuditSection, id: string, text: string) => {
    if (!text.trim()) return;
    setAudit((prev: AuditState) => ({
      ...prev,
      [section]: prev[section].map((f) =>
        f.id === id
          ? {
              ...f,
              comments: [
                ...f.comments,
                {
                  id: Date.now().toString() + Math.random(),
                  author: currentUser.name,
                  text,
                  createdAt: new Date().toISOString(),
                },
              ],
              activityLog: [
                ...(f.activityLog || []),
                {
                  id: Date.now().toString() + Math.random(),
                  action: 'Comment Added',
                  user: currentUser.name,
                  timestamp: new Date().toISOString(),
                  details: text,
                },
              ],
            }
          : f
      ),
    }));
    setCommentInputs((prev) => ({ ...prev, [id]: '' }));
    addNotification({
      message: `${currentUser.name} commented on a finding in ${section.charAt(0).toUpperCase() + section.slice(1)}.`,
      type: 'info' as NotificationType,
    });

    // Mention notifications
    const mentionRegex = /@([\w\s]+)/g;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1].trim();
      const mentionedUser = users.find(u => u.name.toLowerCase() === mentionedName.toLowerCase());
      if (mentionedUser) {
        addNotification({
          message: `You were mentioned by ${currentUser.name} in a comment on a finding in ${section.charAt(0).toUpperCase() + section.slice(1)}.`,
          type: 'info' as NotificationType,
        });
      }
    }
  }, [currentUser.name, users, setAudit, addNotification]);

  // Set approval status
  const setApprovalStatus = useCallback((
    section: AuditSection,
    id: string,
    status: ApprovalStatus
  ) => {
    setAudit((prev: AuditState) => ({
      ...prev,
      [section]: prev[section].map((f) =>
        f.id === id ? { ...f, approvalStatus: status, activityLog: [
          ...(f.activityLog || []),
          {
            id: Date.now().toString() + Math.random(),
            action: `Approval Status Changed`,
            user: currentUser.name,
            timestamp: new Date().toISOString(),
            details: `Moved to ${status}`,
          },
        ] } : f
      ),
    }));

    const finding = audit[section].find(f => f.id === id);
    if (finding && finding.assignee) {
      addNotification({
        message: `Your finding in ${section.charAt(0).toUpperCase() + section.slice(1)} is now at stage: ${status} (by ${currentUser.name}).`,
        type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'warning' : 'info' as NotificationType,
      });
    }
  }, [currentUser.name, audit, setAudit, addNotification]);

  // Bulk action handlers
  const handleSelectFinding = useCallback((id: string) => {
    setSelectedFindings((prev) => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }, []);

  const handleSelectAll = useCallback((section: AuditSection) => {
    const allIds = audit[section].map(f => f.id);
    setSelectedFindings((prev) => prev.length === allIds.length ? [] : allIds);
  }, [audit]);

  const handleBulkApprove = useCallback((section: AuditSection, status: ApprovalStatus) => {
    setAudit((prev: AuditState) => ({
      ...prev,
      [section]: prev[section].map(f =>
        selectedFindings.includes(f.id)
          ? {
              ...f,
              approvalStatus: status,
              activityLog: [
                ...(f.activityLog || []),
                {
                  id: Date.now().toString() + Math.random(),
                  action: `Bulk Approval Status Changed`,
                  user: currentUser.name,
                  timestamp: new Date().toISOString(),
                  details: `Bulk moved to ${status}`,
                },
              ],
            }
          : f
      ),
    }));

    audit[section].forEach(f => {
      if (selectedFindings.includes(f.id) && f.assignee) {
        addNotification({
          message: `Your finding in ${section.charAt(0).toUpperCase() + section.slice(1)} was bulk moved to ${status} by ${currentUser.name}.`,
          type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'warning' : 'info' as NotificationType,
        });
      }
    });
    setSelectedFindings([]);
  }, [currentUser.name, audit, selectedFindings, setAudit, addNotification]);

  // Render section content
  const renderSection = (section: AuditSection, label: string) => {
    // Filtered findings
    const findings = audit[section].filter(f => {
      const matchesSearch =
        f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.recommendation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = filterSeverity ? f.severity === filterSeverity : true;
      const matchesStatus = filterStatus ? f.status === filterStatus : true;
      const matchesAssignee = filterAssignee ? f.assignee === filterAssignee : true;
      
      // Debug logging
      console.log('Search term:', searchTerm);
      console.log('Finding:', f);
      console.log('Matches search:', matchesSearch);
      
      return matchesSearch && matchesSeverity && matchesStatus && matchesAssignee;
    });
    return (
      <Box>
        <Typography variant="h6" gutterBottom>{label} Findings</Typography>
        {/* Search & Filter Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search Findings"
            placeholder="Search in descriptions and recommendations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              title: "Search through finding descriptions and recommendations"
            }}
          />
          <TextField
            label="Severity"
            select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as FindingSeverity | '')}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </TextField>
          <TextField
            label="Status"
            select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as FindingStatus | '')}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
          </TextField>
          <TextField
            label="Assignee"
            select
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            {users.map(u => (
              <MenuItem key={u.id} value={u.name}>{u.name}</MenuItem>
            ))}
          </TextField>
        </Box>
        {/* Bulk Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Button size="small" variant="outlined" onClick={() => handleSelectAll(section)}>
            {selectedFindings.length === audit[section].length ? 'Deselect All' : 'Select All'}
          </Button>
          {(currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.ADMIN) && selectedFindings.length > 0 && (
            <>
              <Button size="small" color="success" variant="contained" sx={{ ml: 1 }} onClick={() => handleBulkApprove(section, 'Approved')}>
                Bulk Approve
              </Button>
              <Button size="small" color="error" variant="contained" sx={{ ml: 1 }} onClick={() => handleBulkApprove(section, 'Rejected')}>
                Bulk Reject
              </Button>
            </>
          )}
        </Box>
        {/* Only allow ADMIN or MANAGER to add findings */}
        {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
          <Button variant="contained" color="primary" onClick={() => addFinding(section)} sx={{ mb: 2 }}>
            Add Finding
          </Button>
        )}

        {/* Findings List */}
        {findings.map((finding) => (
          <FindingCard
            key={finding.id}
            finding={finding}
            section={section}
            users={users}
            currentUser={currentUser}
            isSelected={selectedFindings.includes(finding.id)}
            onSelect={handleSelectFinding}
            onUpdate={(field, value) => updateFinding(section, finding.id, field, value)}
            onRemove={() => {
              setAudit((prev) => ({
                ...prev,
                [section]: prev[section].filter((f) => f.id !== finding.id),
              }));
            }}
            onPhotoUpload={(file) => handlePhotoUpload(section, finding.id, file)}
            onAddComment={(text) => addComment(section, finding.id, text)}
            onSetApprovalStatus={(status) => setApprovalStatus(section, finding.id, status as ApprovalStatus)}
            commentInput={commentInputs[finding.id] || ''}
            onCommentInputChange={(value) => setCommentInputs(prev => ({ ...prev, [finding.id]: value }))}
          />
        ))}

        {/* Workflow Admin (for admins only) */}
        {currentUser.role === UserRole.ADMIN && (
          <Box sx={{ mt: 4 }}>
            <WorkflowAdmin
              workflowStages={workflowStages}
              onAddStage={(stage) => setWorkflowStages([...workflowStages, stage])}
              onRemoveStage={(stage) => setWorkflowStages(workflowStages.filter(s => s !== stage))}
              isAdmin={true}
            />
          </Box>
        )}
      </Box>
    );
  };

  // Stepper navigation
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Divider sx={{ mb: 3 }} />

      {/* Step Content */}
      {activeStep === 0 && renderSection('lighting', 'Lighting')}
      {activeStep === 1 && renderSection('hvac', 'HVAC')}
      {activeStep === 2 && renderSection('envelope', 'Envelope')}
      {activeStep === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Summary & Review</Typography>
          <TextField
            label="Audit Summary & Notes"
            value={audit.summary}
            onChange={(e) => setAudit(prev => ({ ...prev, summary: e.target.value }))}
            fullWidth
            multiline
            minRows={4}
            sx={{ mb: 3 }}
          />
          <Typography variant="subtitle1" gutterBottom>Findings Overview:</Typography>
          <Grid container spacing={2}>
            {(['lighting', 'hvac', 'envelope'] as const).map((section) =>
              audit[section].map((finding) => (
                <Grid item xs={12} key={finding.id}>
                  <FindingCard
                    finding={finding}
                    section={section}
                    users={users}
                    currentUser={currentUser}
                    isSelected={false}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    onRemove={() => {}}
                    onPhotoUpload={() => {}}
                    onAddComment={() => {}}
                    onSetApprovalStatus={() => {}}
                    commentInput=""
                    onCommentInputChange={() => {}}
                  />
                </Grid>
              ))
            )}
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={exportToPDF}>
              Export to PDF
            </Button>
            <Button variant="outlined" onClick={exportToCSV}>
              Export to CSV
            </Button>
            <Button variant="outlined" onClick={exportToExcel}>
              Export to Excel
            </Button>
          </Box>
        </Box>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button variant="contained" color="success">
            Finish Audit
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default EnergyAuditWizard; 