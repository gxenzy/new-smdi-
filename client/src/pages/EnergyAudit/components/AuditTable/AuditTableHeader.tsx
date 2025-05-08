import React from 'react';
import { TableHead, TableRow, TableCell, Tooltip } from '@mui/material';

const AuditTableHeader: React.FC = () => (
  <TableHead sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} aria-label="Audit Table Header">
    <TableRow>
      <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="columnheader">Item No.</TableCell>
      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="columnheader">Category</TableCell>
      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="columnheader">Conditions</TableCell>
      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="columnheader">Reference Standards</TableCell>
      <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="columnheader">Completed</TableCell>
      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="columnheader">
        <Tooltip title="Risk Index: Probability, Severity, and Assessment">
          <span>Risk Index</span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="columnheader">Comments</TableCell>
      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'primary.contrastText', minWidth: 80, textAlign: 'right', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="columnheader">Actions</TableCell>
    </TableRow>
  </TableHead>
);

export default AuditTableHeader; 