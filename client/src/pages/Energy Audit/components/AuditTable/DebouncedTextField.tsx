import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import debounce from 'lodash.debounce';

interface DebouncedTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value: string | number;
  onChange: (value: string) => void;
}

const DebouncedTextField: React.FC<DebouncedTextFieldProps> = ({ value, onChange, ...props }) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const debouncedUpdate = useMemo(
    () => debounce((val: string) => onChange(val), 150),
    [onChange]
  );

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    debouncedUpdate(newValue);
  }, [debouncedUpdate]);

  return (
    <TextField
      {...props}
      value={internalValue}
      onChange={handleChange}
    />
  );
};

export default DebouncedTextField; 