import React from 'react';
import { Box } from '@mui/material';

const PageBreakWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{
    pageBreakAfter: 'always',
    breakAfter: 'always',
    '@media print': {
      marginBottom: '1cm',
      '&:last-child': {
        pageBreakAfter: 'avoid',
        breakAfter: 'avoid',
        marginBottom: 0,
      },
    },
  }}>
    {children}
  </Box>
);

export default PageBreakWrapper; 