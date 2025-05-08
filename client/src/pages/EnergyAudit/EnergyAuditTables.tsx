import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  Button,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { FixedSizeList } from 'react-window';
import debounce from 'lodash.debounce';
import AuditFindingsPanel from './components/AuditFindingsPanel';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { glassCardSx } from '../../theme/glassCardSx';
import FloorTable from './components/AuditTable/FloorTable';
import StandardTable from './components/AuditTable/StandardTable';
import IntroductionSection from './components/AuditTable/IntroductionSection';
import PageBreakWrapper from './components/AuditTable/PageBreakWrapper';
import { Audit, categories, riskIndexMapping, defaultAuditData, AuditRow, AuditRowMeta } from './components/AuditTable/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import AuditAnalyticsDashboard from './components/AuditTable/AuditAnalyticsDashboard';
import { UserRoleProvider, useUserRole } from './contexts/UserRoleContext';
import AuditHistoryDialog from './components/AuditTable/AuditHistoryDialog';
import { ThemeCustomizationDialog } from './components/Analytics/dialogs/ThemeCustomizationDialog';
import { ThemeSettings } from './components/Analytics/types';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useSnackbar } from 'notistack';
import { useAuthContext } from '../../contexts/AuthContext';
import AuditTableContainer from './components/AuditTable/AuditTableContainer';

// --- Main Component ---
const EnergyAuditTablesInner: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>(() => {
    const saved = localStorage.getItem('energyAudits');
    if (saved) {
      return JSON.parse(saved);
    } else {
      return [{
        id: Date.now(),
        name: 'Audit 1',
        complianceData: {},
        ariData: {},
        probabilityData: {},
        riskSeverityData: {},
        lastSaved: null,
      }];
    }
  });
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(() => {
    const saved = localStorage.getItem('energyAudits');
    if (saved) {
      const audits: Audit[] = JSON.parse(saved);
      return audits.length > 0 ? audits[0].id : null;
    } else {
      return null;
    }
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [auditSearch, setAuditSearch] = useState('');
  const { role, setRole } = useUserRole();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyAuditId, setHistoryAuditId] = useState<number | null>(null);
  const [auditHistories, setAuditHistories] = useState<{ [id: number]: { timestamp: string; data: any }[] }>(() => {
    const saved = localStorage.getItem('energyAuditHistories');
    return saved ? JSON.parse(saved) : {};
  });
  // Real-time collaboration
  const [isLive, setIsLive] = useState(true); // true if connected
  const wsRef = useRef<WebSocket | null>(null);
  // Theme customization state
  const { currentUser, updatePreferences } = useAuthContext();
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('energyAuditTable_themeSettings');
    const userTheme = getThemeSettingsFromUser(currentUser);
    return userTheme || (saved ? JSON.parse(saved) : {
      mode: 'light',
      primaryColor: '#1976d2',
      secondaryColor: '#9c27b0',
      fontSize: 'medium',
    });
  });
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const localTheme = useMemo(() => createTheme({
    palette: {
      mode: themeSettings.mode,
      primary: { main: themeSettings.primaryColor },
      secondary: { main: themeSettings.secondaryColor },
    },
    typography: {
      fontSize: themeSettings.fontSize === 'small' ? 14 : themeSettings.fontSize === 'large' ? 18 : 16,
    },
  }), [themeSettings]);
  const { enqueueSnackbar } = useSnackbar();
  const [guidanceOpen, setGuidanceOpen] = useState(false);

  // Restore selectedAudit variable
  const selectedAudit = audits.find(audit => audit.id === selectedAuditId);

  useEffect(() => {
    localStorage.setItem('energyAudits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('energyAuditHistories', JSON.stringify(auditHistories));
  }, [auditHistories]);

  useEffect(() => {
    localStorage.setItem('energyAuditTable_themeSettings', JSON.stringify(themeSettings));
    // Only sync to user preferences if preferences and custom are supported
    if (currentUser && typeof currentUser === 'object' && 'preferences' in currentUser && currentUser.preferences && typeof currentUser.preferences === 'object') {
      let custom = {};
      try {
        custom = 'custom' in currentUser.preferences && currentUser.preferences.custom
          ? (typeof currentUser.preferences.custom === 'string' ? JSON.parse(currentUser.preferences.custom) : currentUser.preferences.custom)
          : {};
        (custom as Record<string, any>).energyAuditTableTheme = themeSettings;
      } catch {}
      // Only call updatePreferences if it accepts a custom property
      if (typeof updatePreferences === 'function') {
        try { updatePreferences({ custom: JSON.stringify(custom) } as any); } catch {}
      }
    }
  }, [themeSettings, currentUser, updatePreferences]);

  useEffect(() => {
    // DEMO: Connect to a local WebSocket server (replace with your backend URL)
    const ws = new window.WebSocket('ws://localhost:8080');
    wsRef.current = ws;
    ws.onopen = () => setIsLive(true);
    ws.onclose = () => setIsLive(false);
    ws.onerror = () => setIsLive(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data) && data[0]?.id && data[0]?.name) {
          setAudits(data);
        }
      } catch (e) { /* ignore */ }
    };
    return () => ws.close();
  }, []);

  // Send audits to WebSocket on change
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(audits));
    }
  }, [audits]);

  const createNewAudit = useCallback(() => {
    const newAudit: Audit = {
      id: Date.now(),
      name: `Audit ${audits.length + 1}`,
      complianceData: {},
      ariData: {},
      probabilityData: {},
      riskSeverityData: {},
      lastSaved: null,
    };
    setAudits(prev => [...prev, newAudit]);
    setSelectedAuditId(newAudit.id);
  }, [audits.length]);

  const deleteAudit = useCallback((id: number) => {
    setAudits(prev => {
      const filtered = prev.filter(audit => audit.id !== id);
      if (filtered.length > 0) {
        setSelectedAuditId(filtered[0].id);
      } else {
        setSelectedAuditId(null);
      }
      return filtered;
    });
  }, []);

  const addAuditHistory = (audit: Audit) => {
    setAuditHistories(prev => {
      const prevHistory = prev[audit.id] || [];
      const newHistory = [
        { timestamp: new Date().toLocaleString(), data: { ...audit } },
        ...prevHistory
      ].slice(0, 20); // keep last 20 versions
      return { ...prev, [audit.id]: newHistory };
    });
  };

  const updateAuditField = useCallback((field: string, floor: string, standard: string, value: any) => {
    setAudits(prev =>
      prev.map(audit => {
        if (audit.id !== selectedAuditId) return audit;
        const updatedAudit = { ...audit };
        if (field === 'date' || field === 'inspector' || field === 'location' || field === 'comments') {
          (updatedAudit as any)[field] = value;
        } else {
          if (!updatedAudit[field]) updatedAudit[field] = {};
          if (!updatedAudit[field][floor]) updatedAudit[field][floor] = {};
          updatedAudit[field][floor][standard] = value;
        }
        addAuditHistory(updatedAudit);
        return updatedAudit;
      })
    );
  }, [selectedAuditId]);

  const calculatePercentage = useCallback((values: (number | string)[]): string[] => {
    if (!Array.isArray(values)) {
      return ['0', '0'];
    }
    const total = Number(values.reduce((acc, val) => Number(acc) + (typeof val === 'number' ? val : Number(val) || 0), 0));
    return values.map(val => {
      const numVal = typeof val === 'number' ? val : Number(val) || 0;
      return total > 0 ? ((numVal / total) * 100).toFixed(2) : '0';
    });
  }, []);

  const calculateValue = useCallback((ari: string) => {
    return riskIndexMapping[ari] || 0;
  }, []);

  const saveCurrentAudit = useCallback(() => {
    setAudits(prev =>
      prev.map(audit =>
        audit.id === selectedAuditId ? { ...audit, lastSaved: new Date().toLocaleString() } : audit
      )
    );
    if (selectedAudit) addAuditHistory({ ...selectedAudit, lastSaved: new Date().toLocaleString() });
    setSnackbarOpen(true);
  }, [selectedAuditId, selectedAudit]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handlePrint = useCallback(() => {
    const content = printRef.current;
    if (!content) return;
    const originalOverflow = document.body.style.overflow;
    const originalHeight = content.style.height;
    requestAnimationFrame(() => {
      document.body.style.overflow = 'visible';
      content.style.height = 'auto';
      window.print();
      requestAnimationFrame(() => {
        document.body.style.overflow = originalOverflow;
        content.style.height = originalHeight;
      });
    });
  }, []);

  // Export all floor and standard tables to Excel
  const handleExportExcel = useCallback(() => {
    if (!selectedAudit) return;
    const wb = XLSX.utils.book_new();
    // Floor tables
    Object.keys(categories).forEach(floor => {
      const rows = categories[floor].map((category, idx) => {
        const compliance = selectedAudit.complianceData?.[floor]?.[category] || {};
        const completed = compliance.completed ? 'Yes' : 'No';
        const ari = selectedAudit.ariData?.[floor]?.[category] || '';
        const po = selectedAudit.probabilityData?.[floor]?.[category] || '';
        const so = selectedAudit.riskSeverityData?.[floor]?.[category] || '';
        return {
          'Item No.': idx + 1,
          'Category': category,
          'Conditions': 'Size of Wires, Protection, Electrical Outlet, Lighting',
          'Reference Standards': 'PEC Article 3, PEC Article 2.40, PEC Article 3.0.1.14-15, PEC Article 3',
          'Completed': completed,
          'PO': po,
          'SO': so,
          'ARI': ari,
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, floor);
    });
    // Standard tables
    ['Size of Wires', 'Protection', 'Electrical Outlets', 'Lighting'].forEach(standard => {
      const rows = Object.keys(categories).map(floor => {
        const compliance = selectedAudit.complianceData?.[floor]?.[standard] || {};
        return {
          'Floor': floor,
          'Complied': compliance.complied || 0,
          'Non Compliant': compliance.nonCompliant || 0,
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, `${standard} Compliance`);
    });
    XLSX.writeFile(wb, `${selectedAudit.name.replace(/\s+/g, '_')}_audit.xlsx`);
  }, [selectedAudit]);

  // Export all floor and standard tables to PDF
  const handleExportPDF = useCallback(() => {
    if (!selectedAudit) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Electrical Audit Checklist', 14, 16);
    doc.setFontSize(12);
    let y = 24;
    // Introduction
    doc.text(`Date: ${selectedAudit.date ? new Date(selectedAudit.date).toLocaleDateString() : ''}`, 14, y);
    y += 6;
    doc.text(`Inspector: ${selectedAudit.inspector || ''}`, 14, y);
    y += 6;
    doc.text(`Location: ${selectedAudit.location || ''}`, 14, y);
    y += 6;
    doc.text(`Comments: ${selectedAudit.comments || ''}`, 14, y);
    y += 10;
    // Floor tables
    Object.keys(categories).forEach(floor => {
      doc.setFontSize(14);
      doc.text(`Assessment of Old Building ${floor}`, 14, y);
      y += 6;
      const tableRows = categories[floor].map((category, idx) => {
        const compliance = selectedAudit.complianceData?.[floor]?.[category] || {};
        const completed = compliance.completed ? 'Yes' : 'No';
        const ari = selectedAudit.ariData?.[floor]?.[category] || '';
        const po = selectedAudit.probabilityData?.[floor]?.[category] || '';
        const so = selectedAudit.riskSeverityData?.[floor]?.[category] || '';
        return [
          idx + 1,
          category,
          'Size of Wires, Protection, Electrical Outlet, Lighting',
          'PEC Article 3, PEC Article 2.40, PEC Article 3.0.1.14-15, PEC Article 3',
          completed,
          po,
          so,
          ari,
        ];
      });
      doc.autoTable({
        head: [[
          'Item No.', 'Category', 'Conditions', 'Reference Standards', 'Completed', 'PO', 'SO', 'ARI'
        ]],
        body: tableRows,
        startY: y,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
      if (y > 250) {
        doc.addPage();
        y = 16;
      }
    });
    // Standard tables
    ['Size of Wires', 'Protection', 'Electrical Outlets', 'Lighting'].forEach(standard => {
      doc.setFontSize(14);
      doc.text(`Standard Compliance per Floor for ${standard}`, 14, y);
      y += 6;
      const tableRows = Object.keys(categories).map(floor => {
        const compliance = selectedAudit.complianceData?.[floor]?.[standard] || {};
        return [
          floor,
          compliance.complied || 0,
          compliance.nonCompliant || 0,
        ];
      });
      doc.autoTable({
        head: [[
          'Floor', 'Complied', 'Non Compliant'
        ]],
        body: tableRows,
        startY: y,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
      if (y > 250) {
        doc.addPage();
        y = 16;
      }
    });
    doc.save(`${selectedAudit.name.replace(/\s+/g, '_')}_audit.pdf`);
  }, [selectedAudit]);

  const floorTables = useMemo(() => (
    Object.keys(categories).map(floor => (
      <FloorTable
        key={floor}
        floor={floor}
        selectedAudit={selectedAudit!}
        updateAuditField={updateAuditField}
        calculateValue={calculateValue}
      />
    ))
  ), [selectedAudit, updateAuditField, calculateValue]);

  const standardTables = useMemo(() => (
    ['Size of Wires', 'Protection', 'Electrical Outlets', 'Lighting'].map((standard, index) => (
      <StandardTable
        key={index}
        standard={standard}
        selectedAudit={selectedAudit!}
        updateAuditField={updateAuditField}
        calculatePercentage={calculatePercentage}
      />
    ))
  ), [selectedAudit, updateAuditField, calculatePercentage]);

  const handleRestoreAuditVersion = (versionIdx: number) => {
    if (historyAuditId == null) return;
    const history = auditHistories[historyAuditId];
    if (!history || !history[versionIdx]) return;
    setAudits(prev => prev.map(audit =>
      audit.id === historyAuditId ? { ...history[versionIdx].data } : audit
    ));
    setHistoryDialogOpen(false);
  };

  const complianceTrendData = useMemo(() => {
    if (!selectedAudit) return [];
    // Example: compliance rate by floor
    return Object.keys(categories).map(floor => {
      const cats = categories[floor];
      const completed = cats.filter(cat => selectedAudit.complianceData?.[floor]?.[cat]?.completed).length;
      return {
        floor,
        completed,
        total: cats.length,
        rate: cats.length ? Math.round((completed / cats.length) * 100) : 0,
      };
    });
  }, [selectedAudit]);

  const riskDistData = useMemo(() => {
    if (!selectedAudit) return [];
    const riskCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    Object.keys(categories).forEach(floor => {
      categories[floor].forEach(cat => {
        const ari = selectedAudit.ariData?.[floor]?.[cat] || '';
        const risk = riskIndexMapping[ari] || 0;
        if (risk) riskCounts[risk] = (riskCounts[risk] || 0) + 1;
      });
    });
    return [1, 2, 3, 4].map(risk => ({
      name: `Risk ${risk}`,
      value: riskCounts[risk],
    }));
  }, [selectedAudit]);
  const riskColors = ['#388e3c', '#1976d2', '#fbc02d', '#d32f2f'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportExcel();
        enqueueSnackbar('Exported to Excel (Ctrl+E)', { variant: 'info' });
      } else if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewAudit();
        enqueueSnackbar('Created new audit (Ctrl+N)', { variant: 'success' });
      } else if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowThemeDialog(true);
        enqueueSnackbar('Opened table theme settings (Ctrl+T)', { variant: 'info' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExportExcel, createNewAudit, setShowThemeDialog, enqueueSnackbar]);

  // Utility: Flatten audit data for main assessment table
  function flattenAuditToRows(audit: Audit): AuditRow[] {
    const rows: AuditRow[] = [];
    const meta = audit.rowMetaData || {};
    Object.keys(categories).forEach(floor => {
      categories[floor].forEach((category, idx) => {
        const rowId = `${floor}__${category}`;
        const compliance = audit.complianceData?.[floor]?.[category] || {};
        const riskIndex = {
          PO: audit.probabilityData?.[floor]?.[category] || 1,
          SO: audit.riskSeverityData?.[floor]?.[category] || 'A',
          ARI: audit.ariData?.[floor]?.[category] || '1A',
          value: riskIndexMapping[audit.ariData?.[floor]?.[category] || '1A'] || 1,
        };
        const rowMeta: AuditRowMeta = meta[rowId] || {};
        if (rowMeta.archived) return; // skip archived rows
        rows.push({
          id: rowId,
          category,
          conditions: ['Size of Wires', 'Protection', 'Electrical Outlet', 'Lighting'],
          referenceStandards: ['PEC Article 3.0', 'PEC Article 2.40', 'PEC Article 3.0.1.14-15', 'PEC Article 3.0'],
          completed: !!compliance.completed,
          riskIndex,
          comments: rowMeta.comments || '',
        });
      });
    });
    return rows;
  }

  return (
    <ThemeProvider theme={localTheme}>
      <Paper elevation={3} sx={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh', overflow: 'hidden', bgcolor: '#f5f5f5', '@media print': { display: 'block', height: 'auto', overflow: 'visible', bgcolor: 'white' } }}>
        <Box className="no-print" sx={{ borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', bgcolor: 'white', p: 2, '@media print': { display: 'none' } }}>
          <Typography variant="h6" gutterBottom>
            Audits
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <label htmlFor="role-switcher" style={{ fontSize: 12 }}>Role:</label>
                <select
                  id="role-switcher"
                  value={role}
                  onChange={e => setRole(e.target.value as 'admin' | 'viewer')}
                  style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4 }}
                  aria-label="Switch user role"
                >
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </Box>
              <Tooltip title="Real-time collaboration coming soon!" placement="left">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CircularProgress size={12} color="success" sx={{ mr: 0.5 }} />
                  <span style={{ fontSize: 12, color: '#388e3c', fontWeight: 500 }}>Live</span>
                </Box>
              </Tooltip>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createNewAudit}
            fullWidth
            sx={{ mb: 2 }}
            disabled={role !== 'admin'}
            aria-label="Create new audit"
          >
            Create New Audit
          </Button>
          <Box sx={{ mb: 2 }}>
            <input
              type="text"
              placeholder="Search audits..."
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
              aria-label="Search audits by name"
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </Box>
          <List sx={{ flexGrow: 1, overflowY: 'auto' }} role="listbox" aria-label="Audit list">
            {audits
              .filter(audit => audit.name.toLowerCase().includes(auditSearch.toLowerCase()))
              .map(audit => (
                <ListItem
                  button
                  key={audit.id}
                  selected={audit.id === selectedAuditId}
                  onClick={() => setSelectedAuditId(audit.id)}
                  role="option"
                  tabIndex={0}
                  aria-selected={audit.id === selectedAuditId}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {role === 'admin' && (
                        <>
                          <Tooltip title="Audit History">
                            <IconButton edge="end" color="info" aria-label={`View history for ${audit.name}`} onClick={e => { e.stopPropagation(); setHistoryAuditId(audit.id); setHistoryDialogOpen(true); }}>
                              <span className="material-icons">history</span>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Audit">
                            <IconButton edge="end" color="error" aria-label={`Delete audit ${audit.name}`} onClick={e => { e.stopPropagation(); deleteAudit(audit.id); }}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  }
                >
                  <ListItemText primary={audit.name} secondary={audit.lastSaved ? `Last saved: ${audit.lastSaved}` : ''} />
                </ListItem>
              ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveCurrentAudit}
              sx={{ flexGrow: 1, mr: 1 }}
              disabled={role !== 'admin'}
              aria-label="Save current audit"
            >
              Save Current Audit
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ flexGrow: 1, ml: 1 }}
              aria-label="Print audit"
            >
              Print
            </Button>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="info" fullWidth onClick={handleExportExcel} disabled={!selectedAudit} aria-label="Export audit to Excel">Export to Excel</Button>
            <Button variant="outlined" color="info" fullWidth onClick={handleExportPDF} disabled={!selectedAudit} aria-label="Export audit to PDF">Export to PDF</Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', '@media print': { height: 'auto' } }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white', position: 'sticky', top: 0, zIndex: 1, '@media print': { display: 'none' }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" color="primary" onClick={() => setShowThemeDialog(true)} sx={{ mr: 2 }}>
              Table Theme Settings
            </Button>
            <IconButton aria-label="Guidance" onClick={() => setGuidanceOpen(true)} sx={{ ml: 'auto' }}>
              <HelpOutlineIcon />
            </IconButton>
          </Box>
          <Box ref={printRef} sx={{ flex: 1, p: 3, overflow: 'auto', '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '8px', '&:hover': { backgroundColor: 'rgba(0,0,0,0.25)' } }, '@media print': { overflow: 'visible', height: 'auto', padding: 0 } }}>
            {selectedAudit ? (
              <>
                <AuditTableContainer
                  rows={flattenAuditToRows(selectedAudit)}
                  onRowChange={row => {
                    const [floor, category] = row.id.split('__');
                    setAudits(prev => prev.map(audit => {
                      if (audit.id !== selectedAuditId) return audit;
                      const updated = { ...audit };
                      if (!updated.complianceData[floor]) updated.complianceData[floor] = {};
                      updated.complianceData[floor][category] = {
                        ...updated.complianceData[floor][category],
                        completed: row.completed,
                      };
                      if (!updated.probabilityData[floor]) updated.probabilityData[floor] = {};
                      updated.probabilityData[floor][category] = row.riskIndex.PO;
                      if (!updated.riskSeverityData[floor]) updated.riskSeverityData[floor] = {};
                      updated.riskSeverityData[floor][category] = row.riskIndex.SO;
                      if (!updated.ariData[floor]) updated.ariData[floor] = {};
                      updated.ariData[floor][category] = row.riskIndex.ARI;
                      // Update comments in rowMetaData
                      updated.rowMetaData = { ...(updated.rowMetaData || {}) };
                      updated.rowMetaData[row.id] = {
                        ...(updated.rowMetaData[row.id] || {}),
                        comments: row.comments,
                      };
                      return updated;
                    }));
                  }}
                  onAddRow={() => {/* Not supported for flattened view */}}
                  onDeleteRow={id => {/* Not supported for flattened view */}}
                  onDuplicateRow={row => {
                    // Create a new row with a unique id and copy meta
                    const [floor, category] = row.id.split('__');
                    const newId = `${floor}__${category}__${Date.now()}`;
                    setAudits(prev => prev.map(audit => {
                      if (audit.id !== selectedAuditId) return audit;
                      const updated = { ...audit };
                      updated.rowMetaData = { ...(updated.rowMetaData || {}) };
                      updated.rowMetaData[newId] = { ...updated.rowMetaData?.[row.id] };
                      // No need to update complianceData, as this is a virtual row
                      return updated;
                    }));
                  }}
                  onArchiveRow={row => {
                    setAudits(prev => prev.map(audit => {
                      if (audit.id !== selectedAuditId) return audit;
                      const updated = { ...audit };
                      updated.rowMetaData = { ...(updated.rowMetaData || {}) };
                      updated.rowMetaData[row.id] = {
                        ...(updated.rowMetaData[row.id] || {}),
                        archived: true,
                      };
                      return updated;
                    }));
                  }}
                  onQuickComment={(row, comment) => {
                    setAudits(prev => prev.map(audit => {
                      if (audit.id !== selectedAuditId) return audit;
                      const updated = { ...audit };
                      updated.rowMetaData = { ...(updated.rowMetaData || {}) };
                      updated.rowMetaData[row.id] = {
                        ...(updated.rowMetaData[row.id] || {}),
                        comments: comment,
                      };
                      return updated;
                    }));
                  }}
                />
                <Box sx={{ mb: 3, display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-start' }} aria-live="polite">
                  <Box sx={{ minWidth: 320, flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Compliance Rate by Floor</Typography>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={complianceTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <XAxis dataKey="floor" />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
                        <RechartsTooltip formatter={v => `${v}%`} />
                        <Line type="monotone" dataKey="rate" stroke="#1976d2" strokeWidth={2} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ minWidth: 320, flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Risk Distribution</Typography>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={riskDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                          {riskDistData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={riskColors[idx]} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
                <Box aria-live="polite">
                  <AuditAnalyticsDashboard selectedAudit={selectedAudit} calculateValue={calculateValue} />
                </Box>
                <PageBreakWrapper>
                  <Paper elevation={2} sx={{ mb: 3, bgcolor: 'white', border: '1px solid #ddd', overflow: 'visible', '@media print': { backgroundColor: 'white !important', boxShadow: 'none !important', border: '1px solid #000 !important', pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '1cm', '& .MuiInputBase-root': { height: 'auto !important', minHeight: 'unset !important' }, '& .print-comments .MuiInputBase-root': { minHeight: '120px !important' }, '& textarea': { whiteSpace: 'pre-wrap !important', wordBreak: 'break-word !important', overflow: 'visible !important', height: 'auto !important' } } }}>
                    <Typography variant="h5" align="center" fontWeight="bold" sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', py: 2, px: 3, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                      ELECTRICAL AUDIT CHECKLIST
                    </Typography>
                    <IntroductionSection 
                      selectedAudit={selectedAudit}
                      updateAuditField={updateAuditField}
                    />
                    {selectedAudit?.id && (
                      <AuditFindingsPanel auditId={String(selectedAudit.id)} />
                    )}
                  </Paper>
                </PageBreakWrapper>
                {floorTables}
                {standardTables}
              </>
            ) : (
              <Typography>Select or create an audit to begin.</Typography>
            )}
          </Box>
        </Box>
        <AuditHistoryDialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          auditId={historyAuditId ?? 0}
          history={historyAuditId != null ? (auditHistories[historyAuditId] || []) : []}
          onRestore={handleRestoreAuditVersion}
        />
        <ThemeCustomizationDialog
          open={showThemeDialog}
          onClose={() => setShowThemeDialog(false)}
          settings={themeSettings}
          onSettingsChange={setThemeSettings}
        />
        <Dialog open={guidanceOpen} onClose={() => setGuidanceOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Table Guidance & Shortcuts</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" fontWeight="bold">Keyboard Shortcuts</Typography>
            <ul>
              <li><b>Ctrl+E</b>: Export to Excel</li>
              <li><b>Ctrl+N</b>: Create new audit</li>
              <li><b>Ctrl+T</b>: Open table theme settings</li>
              <li><b>Tab/Shift+Tab</b>: Navigate cells/fields</li>
            </ul>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Row Actions</Typography>
            <ul>
              <li><b>Duplicate</b>: Clone the current row</li>
              <li><b>Archive</b>: Soft-delete the row (can be restored)</li>
              <li><b>Quick Comment</b>: Add a quick note to the row</li>
            </ul>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Field Descriptions</Typography>
            <ul>
              <li><b>Risk Index</b>: 1 = Low, 2 = Moderate, 3 = High, 4 = Critical (see tooltips for details)</li>
              <li><b>ARI</b>: Assessment Risk Index, a code combining Probability and Severity</li>
              <li><b>PO</b>: Probability of Occurrence (1-5, 5 = Frequent)</li>
              <li><b>SO</b>: Severity of Occurrence (A-E, A = Catastrophic)</li>
              <li><b>Completed</b>: Whether the item is finished/checked</li>
              <li><b>Complied</b>: Number of items that meet the standard</li>
              <li><b>Non Compliant</b>: Number of items that do not meet the standard</li>
            </ul>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Standards</Typography>
            <ul>
              <li>Current: <b>PEC</b> (Philippine Electrical Code)</li>
              <li>Can be configured for <b>IEC</b>, <b>ASHRAE</b>, or <b>Custom</b> standards in settings</li>
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGuidanceOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </ThemeProvider>
  );
};

const EnergyAuditTables: React.FC = () => (
  <UserRoleProvider>
    <EnergyAuditTablesInner />
  </UserRoleProvider>
);

export default EnergyAuditTables;

/*
--- Advanced Suggestions for Further Improvements ---
1. Add export to Excel/PDF functionality for all tables.
2. Add column sorting, filtering, and searching for better UX.
3. Add user permissions for audit editing/deleting.
4. Add audit history/versioning for rollback.
5. Add real-time collaboration (WebSocket or Firestore).
6. Add analytics dashboard for audit trends.
7. Add accessibility improvements (ARIA, keyboard nav).
8. Add unit/integration tests for all table logic.
*/

// Helper to get theme settings from user preferences (type-safe)
function getThemeSettingsFromUser(user: any): ThemeSettings | null {
  if (user && typeof user === 'object' && 'preferences' in user && user.preferences && typeof user.preferences === 'object' && 'custom' in user.preferences) {
    try {
      const custom = typeof user.preferences.custom === 'string' ? JSON.parse(user.preferences.custom) : user.preferences.custom;
      if (custom && custom.energyAuditTableTheme) return custom.energyAuditTableTheme;
    } catch {}
  }
  return null;
}
  