import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import axios from 'axios';

/**
 * Test component for the compliance verification API
 */
const ComplianceApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [calculationId, setCalculationId] = useState('test-calculation-001');
  const [calculationType, setCalculationType] = useState('illumination');
  const [calculationData, setCalculationData] = useState(JSON.stringify({
    calculatedLux: 350,
    roomType: 'classroom',
    width: 8,
    length: 10,
    height: 3
  }, null, 2));

  const testVerifyCalculation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/compliance/verify-calculation', {
        calculationId,
        calculationType,
        calculationData: JSON.parse(calculationData)
      });

      setResult(response.data);
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testGetRules = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`/api/compliance/rules?calculationType=${calculationType}`);
      setResult(response.data);
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Compliance API Test
      </Typography>

      <Typography variant="body2" paragraph color="text.secondary">
        This component allows you to test the compliance verification API endpoints.
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Parameters
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <TextField
            label="Calculation ID"
            value={calculationId}
            onChange={(e) => setCalculationId(e.target.value)}
            fullWidth
          />

          <TextField
            label="Calculation Type"
            value={calculationType}
            onChange={(e) => setCalculationType(e.target.value)}
            fullWidth
            helperText="Examples: illumination, power_factor, harmonic_distortion, schedule_of_loads"
          />

          <TextField
            label="Calculation Data (JSON)"
            value={calculationData}
            onChange={(e) => setCalculationData(e.target.value)}
            fullWidth
            multiline
            rows={6}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={testVerifyCalculation}
            disabled={loading}
          >
            Test Verify Calculation
          </Button>

          <Button
            variant="outlined"
            onClick={testGetRules}
            disabled={loading}
          >
            Test Get Rules
          </Button>
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {result && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            API Response
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 400,
              fontSize: '0.875rem'
            }}
          >
            {JSON.stringify(result, null, 2)}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ComplianceApiTest; 