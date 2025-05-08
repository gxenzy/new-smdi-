import React from 'react';
import { Table, TableBody, Paper, Alert, Button, Box, Typography } from '@mui/material';
import { AuditRow, AuditTableProps } from './types';
import AuditTableHeader from './AuditTableHeader';
import AuditTableRow from './AuditTableRow';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import * as XLSX from 'xlsx';

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
  return Papa.unparse({ fields: header, data: data.map(row => header.map(h => row[h])) });
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

const ROW_HEIGHT = 56; // px, adjust as needed for your row height
const VIRTUALIZATION_THRESHOLD = 50;

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

  // Virtualized row renderer
  const Row = ({ index, style }: ListChildComponentProps) => (
    <div style={style}>
      <AuditTableRow key={rows[index].id} row={rows[index]} onChange={onRowChange} onDuplicateRow={onDuplicateRow} onArchiveRow={onArchiveRow} onQuickComment={onQuickComment} />
    </div>
  );

  return (
    <Paper sx={{ width: '100%', overflowX: 'auto', '@media print': { boxShadow: 'none', border: 'none' } }} aria-label="Audit Table Container">
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <Box sx={{ display: 'flex', gap: 4, p: 1, alignItems: 'center', justifyContent: 'flex-start', '@media print': { display: 'none' } }}>
        <Typography variant="subtitle2" color="text.secondary">Total Rows: <b>{totalRows}</b></Typography>
        <Typography variant="subtitle2" color="text.secondary">Completed: <b>{completedRows}</b></Typography>
        <Typography variant="subtitle2" color="text.secondary">Completion Rate: <b>{completionRate}%</b></Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, p: 1, justifyContent: 'flex-end', '@media print': { display: 'none' } }}>
        <Button variant="outlined" onClick={() => handleExport(rows)} size="small">Export JSON</Button>
        <Button variant="outlined" component="label" size="small">
          Import JSON
          <input type="file" accept="application/json" hidden onChange={e => handleImport(e, onImport)} />
        </Button>
        <Button variant="outlined" onClick={() => handleExportCSV(rows)} size="small">Export CSV</Button>
        <Button variant="outlined" component="label" size="small">
          Import CSV
          <input type="file" accept=".csv,text/csv" hidden onChange={e => handleImportCSV(e, onImport)} />
        </Button>
        <Button variant="outlined" onClick={() => handleExportXLSX(rows)} size="small">Export XLSX</Button>
        <Button variant="outlined" component="label" size="small">
          Import XLSX
          <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onChange={e => handleImportXLSX(e, onImport)} />
        </Button>
      </Box>
      {rows.length > VIRTUALIZATION_THRESHOLD && (
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Alert severity="info" sx={{ py: 0.5, px: 2, fontSize: '0.95em', width: 'auto' }}>
            Virtualization active: Only visible rows are rendered for performance.
          </Alert>
        </Box>
      )}
      <Table stickyHeader aria-label="Audit Table" sx={{ backgroundColor: 'background.paper', color: 'text.primary', '@media print': { backgroundColor: 'white', color: 'black' } }}>
        <AuditTableHeader />
        <TableBody>
          {rows.length > VIRTUALIZATION_THRESHOLD ? (
            <List
              height={Math.min(rows.length, 10) * ROW_HEIGHT}
              itemCount={rows.length}
              itemSize={ROW_HEIGHT}
              width="100%"
            >
              {Row}
            </List>
          ) : (
            rows.map((row) => (
              <AuditTableRow key={row.id} row={row} onChange={onRowChange} onDuplicateRow={onDuplicateRow} onArchiveRow={onArchiveRow} onQuickComment={onQuickComment} />
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default AuditTableContainer; 