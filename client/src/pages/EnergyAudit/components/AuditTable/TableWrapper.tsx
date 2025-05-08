import React from 'react';
import { Box } from '@mui/material';

const TableWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{
    '@media print': {
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
      width: '100%',
    },
  }}>
    {children}
  </Box>
);

export default TableWrapper; 