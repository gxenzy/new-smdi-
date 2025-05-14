import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import HarmonicDistortionCalculator from '../HarmonicDistortionCalculator';
import '@testing-library/jest-dom';

// Mock the storage utility
jest.mock('../utils/storage', () => ({
  saveCalculation: jest.fn().mockReturnValue('mock-id'),
  loadSavedCalculations: jest.fn().mockReturnValue([]),
}));

// Mock the axios library
jest.mock('axios');

describe('HarmonicDistortionCalculator Batch Calculation', () => {
  const renderWithSnackbar = (component: React.ReactElement) => {
    return render(
      <SnackbarProvider maxSnack={3}>
        {component}
      </SnackbarProvider>
    );
  };

  const fillBasicInputs = () => {
    // Fill out the basic system inputs
    fireEvent.change(screen.getByLabelText(/System Voltage/i), { 
      target: { value: '480' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Fundamental Voltage/i), { 
      target: { value: '480' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Fundamental Current/i), { 
      target: { value: '100' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Short Circuit Ratio/i), { 
      target: { value: '20' } 
    });
    
    // Select system type
    fireEvent.mouseDown(screen.getByLabelText(/System Type/i));
    fireEvent.click(screen.getByText(/General Distribution System/i));
    
    // Add a harmonic
    fireEvent.click(screen.getByText(/Add Harmonic/i));
    
    // Fill out the harmonic data
    const harmonicInputs = screen.getAllByLabelText(/Harmonic Voltage/i);
    fireEvent.change(harmonicInputs[0], { target: { value: '10' } });
    
    const currentInputs = screen.getAllByLabelText(/Harmonic Current/i);
    fireEvent.change(currentInputs[0], { target: { value: '5' } });
  };

  test('should add scenarios to batch processing', async () => {
    renderWithSnackbar(<HarmonicDistortionCalculator />);
    
    // Fill in the first scenario data
    fillBasicInputs();
    
    // Add to batch
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    // Verify the batch panel now shows
    await waitFor(() => {
      expect(screen.getByText(/Batch Processing/)).toBeInTheDocument();
      expect(screen.getByText(/Scenario 1/)).toBeInTheDocument();
    });
    
    // Modify values for second scenario
    fireEvent.change(screen.getByLabelText(/System Voltage/i), { 
      target: { value: '240' } 
    });
    
    // Add second scenario to batch
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    // Verify we now have two scenarios
    await waitFor(() => {
      expect(screen.getByText(/Batch Processing \(2 scenarios\)/)).toBeInTheDocument();
    });
  });

  test('should process all scenarios in batch', async () => {
    renderWithSnackbar(<HarmonicDistortionCalculator />);
    
    // Set up batch with two scenarios
    fillBasicInputs();
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    fireEvent.change(screen.getByLabelText(/System Voltage/i), { 
      target: { value: '240' } 
    });
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    // Process the batch
    fireEvent.click(screen.getByText(/Process All/i));
    
    // Wait for processing to complete
    await waitFor(() => {
      expect(screen.getByText(/Compare Results/i)).not.toBeDisabled();
    });
  });

  test('should open comparison dialog after processing batch', async () => {
    renderWithSnackbar(<HarmonicDistortionCalculator />);
    
    // Set up and process batch
    fillBasicInputs();
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    fireEvent.change(screen.getByLabelText(/System Voltage/i), { 
      target: { value: '240' } 
    });
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    fireEvent.click(screen.getByText(/Process All/i));
    
    // Wait for processing to complete and open comparison
    await waitFor(() => {
      expect(screen.getByText(/Compare Results/i)).not.toBeDisabled();
    });
    
    fireEvent.click(screen.getByText(/Compare Results/i));
    
    // Verify comparison dialog is open
    await waitFor(() => {
      expect(screen.getByText(/Batch Calculation Comparison/i)).toBeInTheDocument();
      expect(screen.getByText(/THD Comparison/i)).toBeInTheDocument();
    });
  });

  test('should save all batch results', async () => {
    const { saveCalculation } = require('../utils/storage');
    renderWithSnackbar(<HarmonicDistortionCalculator />);
    
    // Set up and process batch
    fillBasicInputs();
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    fireEvent.change(screen.getByLabelText(/System Voltage/i), { 
      target: { value: '240' } 
    });
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    fireEvent.click(screen.getByText(/Process All/i));
    
    // Wait for processing to complete
    await waitFor(() => {
      expect(screen.getByText(/Save All Results/i)).not.toBeDisabled();
    });
    
    // Save all results
    fireEvent.click(screen.getByText(/Save All Results/i));
    
    // Verify save function was called
    expect(saveCalculation).toHaveBeenCalled();
  });

  test('should load batch scenario into calculator', async () => {
    renderWithSnackbar(<HarmonicDistortionCalculator />);
    
    // Set up batch with different scenario values
    fillBasicInputs();
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    // Change to very different value for the second scenario
    fireEvent.change(screen.getByLabelText(/System Voltage/i), { 
      target: { value: '600' } 
    });
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    // Find and click the load button for the first scenario
    const loadButtons = screen.getAllByTitle(/Load scenario/i);
    fireEvent.click(loadButtons[0]);
    
    // Verify original value is loaded back
    await waitFor(() => {
      expect(screen.getByLabelText(/System Voltage/i)).toHaveValue('480');
    });
  });

  test('should remove scenario from batch', async () => {
    renderWithSnackbar(<HarmonicDistortionCalculator />);
    
    // Add two scenarios
    fillBasicInputs();
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    fireEvent.change(screen.getByLabelText(/System Voltage/i), { 
      target: { value: '240' } 
    });
    fireEvent.click(screen.getByText(/Add to Batch Scenarios/i));
    
    // Verify we have two scenarios
    expect(screen.getByText(/Batch Processing \(2 scenarios\)/)).toBeInTheDocument();
    
    // Remove one scenario
    const removeButtons = screen.getAllByTitle(/Remove scenario/i);
    fireEvent.click(removeButtons[0]);
    
    // Verify we now have only one scenario
    await waitFor(() => {
      expect(screen.getByText(/Batch Processing \(1 scenarios\)/)).toBeInTheDocument();
    });
  });
}); 