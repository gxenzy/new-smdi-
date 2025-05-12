import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PowerFactorCalculator from '../PowerFactorCalculator';

// Mock local storage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the storage module
jest.mock('../utils/storage', () => ({
  saveCalculation: jest.fn().mockReturnValue('test-id'),
  getStoredCalculations: jest.fn().mockReturnValue([]),
  getCalculationsByType: jest.fn().mockReturnValue([]),
}));

describe('PowerFactorCalculator Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  test('renders the calculator with default values', () => {
    render(<PowerFactorCalculator />);
    
    // Check the component title is present
    expect(screen.getByText('Power Factor Calculator (PEC 2017 4.30)')).toBeInTheDocument();
    
    // Check the tabs are present
    expect(screen.getByText('Power Measurements')).toBeInTheDocument();
    expect(screen.getByText('System Information')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  test('allows input of measurement values', () => {
    render(<PowerFactorCalculator />);
    
    // Find input fields
    const voltageInput = screen.getByLabelText('Voltage');
    const currentInput = screen.getByLabelText('Current');
    
    // Enter values
    fireEvent.change(voltageInput, { target: { value: '240' } });
    fireEvent.change(currentInput, { target: { value: '60' } });
    
    // Check that values were updated
    expect(voltageInput).toHaveValue(240);
    expect(currentInput).toHaveValue(60);
  });

  test('navigates between tabs', () => {
    render(<PowerFactorCalculator />);
    
    // Check we start on the first tab
    expect(screen.getByText('Electrical Measurements')).toBeVisible();
    
    // Click the next button
    fireEvent.click(screen.getByText('Next: System Information'));
    
    // Check we are on the second tab
    expect(screen.getByText('System Information')).toBeVisible();
    
    // Go back to the first tab
    fireEvent.click(screen.getByText('Back to Power Measurements'));
    
    // Check we are back on the first tab
    expect(screen.getByText('Electrical Measurements')).toBeVisible();
  });

  test('calculates power factor and shows results', async () => {
    render(<PowerFactorCalculator />);
    
    // Navigate to system information tab
    fireEvent.click(screen.getByText('Next: System Information'));
    
    // Click calculate button
    fireEvent.click(screen.getByText('Calculate Power Factor'));
    
    // Wait for calculation to complete and results to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Power Factor Results/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check that key result elements are displayed
    expect(screen.getByText('Power Factor')).toBeInTheDocument();
    expect(screen.getByText('Required Capacitance')).toBeInTheDocument();
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
  });

  test('validates input fields', () => {
    render(<PowerFactorCalculator />);
    
    // Navigate to system information tab
    fireEvent.click(screen.getByText('Next: System Information'));
    
    // Clear voltage field and try to calculate
    const voltageInput = screen.getByLabelText('Voltage');
    fireEvent.change(voltageInput, { target: { value: '' } });
    
    // Go back to first tab to trigger validation
    fireEvent.click(screen.getByText('Back to Power Measurements'));
    fireEvent.click(screen.getByText('Next: System Information'));
    
    // Try to calculate
    fireEvent.click(screen.getByText('Calculate Power Factor'));
    
    // Check for validation error
    expect(screen.getByText('Valid voltage is required')).toBeInTheDocument();
  });

  test('resets calculator to default values', () => {
    render(<PowerFactorCalculator />);
    
    // Change some values
    const voltageInput = screen.getByLabelText('Voltage');
    fireEvent.change(voltageInput, { target: { value: '400' } });
    
    // Click reset button
    fireEvent.click(screen.getByText('Reset'));
    
    // Check that values were reset
    expect(screen.getByLabelText('Voltage')).toHaveValue(230);
  });
}); 