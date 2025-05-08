import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import debounce from 'lodash.debounce';

interface OptimizedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

const OptimizedInput: React.FC<OptimizedInputProps> = ({ label, value, onChange, multiline = false, rows = 1, className }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const debouncedUpdate = useMemo(
    () => debounce((val: string) => onChange && onChange(val), 200),
    [onChange]
  );

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedUpdate(newValue);
    if (multiline && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [debouncedUpdate, multiline]);

  return (
    <Box sx={{ width: '100%' }} className={className}>
      <Typography variant="subtitle2" fontWeight="bold">{label}</Typography>
      <TextField
        value={localValue}
        onChange={handleChange}
        multiline={multiline}
        minRows={rows}
        inputRef={textareaRef}
        fullWidth
        inputProps={{
          style: {
            resize: 'none',
          },
        }}
        sx={{
          width: '100%',
          display: 'block',
          '& .MuiInputBase-root': {
            padding: '8px',
            backgroundColor: 'white',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
            height: 'auto',
            minHeight: multiline ? `${rows * 1.5}em` : 'auto',
          },
          '& .MuiInputBase-input': {
            fontSize: '14px',
            lineHeight: '1.5',
            overflow: 'hidden',
            width: '100%',
            '@media print': {
              position: 'static !important',
              overflow: 'visible !important',
              whiteSpace: 'pre-wrap !important',
              wordBreak: 'break-word !important',
              width: '100% !important',
              height: 'auto !important',
              minHeight: multiline ? '120px' : 'auto',
              fontSize: '12pt !important',
              lineHeight: '1.5 !important',
              pageBreakInside: 'auto !important',
              breakInside: 'auto !important',
            },
          },
          '@media print': {
            '& .MuiInputBase-root': {
              position: 'relative !important',
              display: 'block !important',
              width: '100% !important',
              height: 'auto !important',
              minHeight: multiline ? '120px' : 'auto',
              padding: '12px !important',
              border: '1px solid rgba(0, 0, 0, 0.23) !important',
              pageBreakInside: 'auto !important',
              breakInside: 'auto !important',
              boxSizing: 'border-box !important',
            },
          },
        }}
      />
    </Box>
  );
};

export default OptimizedInput; 