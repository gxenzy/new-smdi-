import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, TableBody, Paper, Alert, Button, Box, Typography, TableContainer, TextField, Checkbox, Snackbar, IconButton, TableRow, TableCell } from '@mui/material';
import { AuditRow, AuditTableProps } from './types';
import AuditTableHeader from './AuditTableHeader';
import AuditTableRow from './AuditTableRow';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import * as XLSX from 'xlsx';
import { useUserRole } from '../../contexts/UserRoleContext';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import LiveTvIcon from '@mui/icons-material/LiveTv';

interface AuditTableContainerProps extends AuditTableProps {
  errorMessage?: string;
  onExport?: () => void;
  onImport?: (data: AuditRow[]) => void;
  onDuplicateRow?: (row: AuditRow) => void;
  onArchiveRow?: (row: AuditRow) => void;
  onQuickComment?: (row: AuditRow, comment: string) => void;
}

// Utility: Convert AuditRow[] to CSV string
const auditRowsToCSV = (rows: AuditRow[]): string => {
  const header = ['id', 'category', 'conditions', 'referenceStandards', 'completed', 'riskIndex_PO', 'riskIndex_SO', 'riskIndex_ARI', 'riskIndex_value', 'comments'];
  const data = rows.map(row => ({
    id: row.id,
    category: row.category,
    conditions: row.conditions.join('; '),
    referenceStandards: row.referenceStandards.join('; '),
    completed: row.completed ? 'TRUE' : 'FALSE',
    riskIndex_PO: row.riskIndex.PO,
    riskIndex_SO: row.riskIndex.SO,
    riskIndex_ARI: row.riskIndex.ARI,
    riskIndex_value: row.riskIndex.value,
    comments: row.comments || '',
  }));
  return Papa.unparse({ fields: header, data: data.map(row => header.map(h => (row as Record<string, any>)[h])) });
};

// Utility: Convert CSV string to AuditRow[]
const csvToAuditRows = (csv: string): AuditRow[] => {
  const result = Papa.parse(csv, { header: true });
  if (!result.data || !Array.isArray(result.data)) return [];
  return (result.data as any[]).map((row, idx) => ({
    id: row.id || String(idx + 1),
    category: row.category || '',
    conditions: (row.conditions || '').split(';').map((s: string) => s.trim()).filter(Boolean),
    referenceStandards: (row.referenceStandards || '').split(';').map((s: string) => s.trim()).filter(Boolean),
    completed: row.completed === 'TRUE',
    riskIndex: {
      PO: Number(row.riskIndex_PO) || 0,
      SO: row.riskIndex_SO || '',
      ARI: row.riskIndex_ARI || '',
      value: Number(row.riskIndex_value) || 0,
    },
    comments: row.comments || '',
  }));
};

const handleExport = (rows: AuditRow[]) => {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
  saveAs(blob, 'audit-table-export.json');
};

const handleImport = (e: React.ChangeEvent<HTMLInputElement>, onImport?: (data: AuditRow[]) => void) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target?.result as string);
      if (onImport) onImport(data);
    } catch (err) {
      alert('Invalid file format.');
    }
  };
  reader.readAsText(file);
};

const handleExportCSV = (rows: AuditRow[]) => {
  const csv = auditRowsToCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  saveAs(blob, 'audit-table-export.csv');
};

const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>, onImport?: (data: AuditRow[]) => void) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const rows = csvToAuditRows(event.target?.result as string);
      if (onImport) onImport(rows);
    } catch (err) {
      alert('Invalid CSV file format.');
    }
  };
  reader.readAsText(file);
};

// Utility: Convert AuditRow[] to worksheet and download as XLSX
const handleExportXLSX = (rows: AuditRow[]) => {
  const ws = XLSX.utils.json_to_sheet(rows.map(row => ({
    id: row.id,
    category: row.category,
    conditions: row.conditions.join('; '),
    referenceStandards: row.referenceStandards.join('; '),
    completed: row.completed ? 'TRUE' : 'FALSE',
    riskIndex_PO: row.riskIndex.PO,
    riskIndex_SO: row.riskIndex.SO,
    riskIndex_ARI: row.riskIndex.ARI,
    riskIndex_value: row.riskIndex.value,
    comments: row.comments || '',
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'AuditTable');
  XLSX.writeFile(wb, 'audit-table-export.xlsx');
};

const handleImportXLSX = (e: React.ChangeEvent<HTMLInputElement>, onImport?: (data: AuditRow[]) => void) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      // Convert to AuditRow[]
      const rows = (json as any[]).map((row, idx) => ({
        id: row.id || String(idx + 1),
        category: row.category || '',
        conditions: (row.conditions || '').split(';').map((s: string) => s.trim()).filter(Boolean),
        referenceStandards: (row.referenceStandards || '').split(';').map((s: string) => s.trim()).filter(Boolean),
        completed: row.completed === 'TRUE',
        riskIndex: {
          PO: Number(row.riskIndex_PO) || 0,
          SO: row.riskIndex_SO || '',
          ARI: row.riskIndex_ARI || '',
          value: Number(row.riskIndex_value) || 0,
        },
        comments: row.comments || '',
      }));
      if (onImport) onImport(rows);
    } catch (err) {
      alert('Invalid XLSX file format.');
    }
  };
  reader.readAsArrayBuffer(file);
};

const AuditTableContainer: React.FC<AuditTableContainerProps> = ({
  rows,
  onRowChange,
  onAddRow,
  onDeleteRow,
  errorMessage,
  onExport,
  onImport,
  onDuplicateRow,
  onArchiveRow,
  onQuickComment,
}) => {
  // Calculate summary stats
  const totalRows = rows.length;
  const completedRows = rows.filter(r => r.completed).length;
  const completionRate = totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0;

  const { role } = useUserRole();
  const showActions = role === 'admin';

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [printPreview, setPrintPreview] = useState(false);
  const [history, setHistory] = useState<AuditRow[][]>([]);
  const [future, setFuture] = useState<AuditRow[][]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isLive, setIsLive] = useState(false);
  const wsRef = useRef<any>(null);

  // Auto-save logic: debounce row changes
  useEffect(() => {
    if (!onImport) return;
    setSaving(true);
    setSaveError(null);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        onImport(rows);
        setSaving(false);
      } catch (err) {
        setSaveError('Failed to save changes.');
        setSaving(false);
      }
    }, 1000); // 1s debounce
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [rows, onImport]);

  // Real-time sync logic
  useEffect(() => {
    if (process.env.REACT_APP_ENABLE_WS !== 'true') return;
    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:8000');
      wsRef.current = socket;
      setIsLive(true);
      socket.on('auditTableUpdate', (newRows: AuditRow[]) => {
        onImport?.(newRows);
      });
      socket.on('disconnect', () => setIsLive(false));
      socket.on('connect', () => setIsLive(true));
    });
    return () => {
      if (wsRef.current) wsRef.current.disconnect();
      setIsLive(false);
    };
  }, [onImport]);

  // Emit updates on row change (debounced with auto-save)
  useEffect(() => {
    if (process.env.REACT_APP_ENABLE_WS !== 'true') return;
    if (!wsRef.current) return;
    wsRef.current.emit('auditTableUpdate', rows);
  }, [rows]);

  // Bulk selection logic
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? rows.map(r => r.id) : []);
  };
  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows(checked ? [...selectedRows, id] : selectedRows.filter(rid => rid !== id));
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (!showActions) return;
    setHistory(h => [...h, rows]);
    const newRows = rows.filter(r => !selectedRows.includes(r.id));
    setSnackbar({ open: true, message: `Deleted ${selectedRows.length} rows.` });
    setSelectedRows([]);
    onImport?.(newRows);
  };

  // Bulk export
  const handleBulkExport = () => {
    const exportRows = rows.filter(r => selectedRows.includes(r.id));
    handleExport(exportRows);
  };

  // Undo/redo
  const handleUndo = () => {
    if (history.length === 0) return;
    setFuture(f => [rows, ...f]);
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    onImport?.(prev);
    setSnackbar({ open: true, message: 'Undo successful.' });
  };
  const handleRedo = () => {
    if (future.length === 0) return;
    setHistory(h => [...h, rows]);
    const next = future[0];
    setFuture(f => f.slice(1));
    onImport?.(next);
    setSnackbar({ open: true, message: 'Redo successful.' });
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center', '@media print': { display: 'none' } }}>
        <Paper sx={{ p: 2, minWidth: 180 }}><Typography variant="subtitle2">Compliance Rate</Typography><Typography variant="h5" color="success.main">{completionRate}%</Typography></Paper>
        <Paper sx={{ p: 2, minWidth: 180 }}><Typography variant="subtitle2">Most Common Finding</Typography><Typography variant="h5">{rows.length ? rows[0].category : '-'}</Typography></Paper>
        <Paper sx={{ p: 2, minWidth: 180 }}><Typography variant="subtitle2">Risk Distribution</Typography><Typography variant="h5">{rows.length ? rows[0].riskIndex.ARI : '-'}</Typography></Paper>
      </Box>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2, p: 1, alignItems: 'center', justifyContent: 'space-between', '@media print': { display: 'none' } }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isLive && <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', fontWeight: 'bold', mr: 1 }}><LiveTvIcon fontSize="small" sx={{ mr: 0.5 }} />Live</Box>}
          <Button variant="contained" onClick={onAddRow} disabled={!showActions}>Add Row</Button>
          <Button variant="outlined" onClick={() => handleExport(rows)} size="small">Export All</Button>
          <Button variant="outlined" onClick={() => handleExportCSV(rows)} size="small">Export CSV</Button>
          <Button variant="outlined" onClick={() => handleExportXLSX(rows)} size="small">Export XLSX</Button>
          <Button variant="outlined" component="label" size="small">
            Import
            <input type="file" accept=".json,.csv,.xlsx" hidden onChange={e => {/* handle import logic */}} />
          </Button>
          <Button variant="outlined" onClick={() => setPrintPreview(true)} size="small">Print Preview</Button>
          <IconButton onClick={handleUndo} disabled={history.length === 0}><UndoIcon /></IconButton>
          <IconButton onClick={handleRedo} disabled={future.length === 0}><RedoIcon /></IconButton>
          {selectedRows.length > 0 && (
            <Button variant="contained" color="error" onClick={handleBulkDelete} disabled={!showActions}>Delete Selected</Button>
          )}
          {selectedRows.length > 0 && (
            <Button variant="contained" onClick={handleBulkExport}>Export Selected</Button>
          )}
        </Box>
        <TextField size="small" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} sx={{ minWidth: 200 }} />
      </Box>
      <Paper sx={{ width: '100%', '@media print': { boxShadow: 'none', border: 'none' } }} aria-label="Audit Table Container">
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Box sx={{ display: 'flex', gap: 4, p: 1, alignItems: 'center', justifyContent: 'flex-start', '@media print': { display: 'none' } }}>
          <Typography variant="subtitle2" color="text.secondary">Total Rows: <b>{totalRows}</b></Typography>
          <Typography variant="subtitle2" color="text.secondary">Completed: <b>{completedRows}</b></Typography>
          <Typography variant="subtitle2" color="text.secondary">Completion Rate: <b>{completionRate}%</b></Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 600, overflow: 'auto', '@media print': { maxHeight: 'none', overflow: 'visible' } }}>
          <Table stickyHeader aria-label="Audit Table" sx={{ backgroundColor: 'background.paper', color: 'text.primary', '@media print': { backgroundColor: 'white', color: 'black' } }}>
            <AuditTableHeader showActions={showActions} />
            <TableBody>
              {/* Bulk select header row */}
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox checked={allSelected} onChange={e => handleSelectAll(e.target.checked)} inputProps={{ 'aria-label': 'Select all rows' }} />
                </TableCell>
                <TableCell /> {/* Item No. */}
                <TableCell /> {/* Category */}
                <TableCell /> {/* Conditions */}
                <TableCell /> {/* Reference Standards */}
                <TableCell /> {/* Completed */}
                <TableCell /> {/* Risk Index */}
                <TableCell /> {/* Comments */}
                {showActions && <TableCell />}
              </TableRow>
              {/* Table rows */}
              {rows.map((row) => (
                <AuditTableRow
                  key={row.id}
                  row={row}
                  onChange={onRowChange}
                  onDuplicateRow={onDuplicateRow}
                  onArchiveRow={onArchiveRow}
                  onQuickComment={onQuickComment}
                  showActions={showActions}
                  selected={selectedRows.includes(row.id)}
                  onSelect={checked => handleSelectRow(row.id, checked)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
      {/* Saving indicator */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000, '@media print': { display: 'none' } }}>
        {saving ? (
          <Paper sx={{ p: 1, bgcolor: 'info.main', color: 'white' }}>Saving...</Paper>
        ) : (
          <Paper sx={{ p: 1, bgcolor: 'success.main', color: 'white' }}>All changes saved</Paper>
        )}
        {saveError && (
          <Paper sx={{ p: 1, bgcolor: 'error.main', color: 'white', mt: 1 }}>{saveError}</Paper>
        )}
      </Box>
    </>
  );
};

export default AuditTableContainer; 