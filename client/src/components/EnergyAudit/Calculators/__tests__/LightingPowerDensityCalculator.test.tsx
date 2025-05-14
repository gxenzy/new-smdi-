import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LightingPowerDensityCalculator from '../LightingPowerDensityCalculator';
import * as utils from '../utils';

// Mock the utility functions
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  loadBuildingStandards: jest.fn().mockResolvedValue({
    office: { label: 'Office', maxLPD: 10.5 },
    classroom: { label: 'Classroom', maxLPD: 10.5 },
    retail: { label: 'Retail', maxLPD: 14.5 }
  }),
  calculateLPDResults: jest.fn().mockImplementation(async (roomData) => {
    const totalWattage = 348.96; // Mocked total wattage
    const lpd = totalWattage / roomData.area;
    const isCompliant = lpd <= 10.5; // Compliance check against office standard
    
    return {
      totalWattage,
      lpd,
      isCompliant,
      standardLPD: 10.5,
      buildingTypeLabel: 'Office',
      recommendations: [
        'Sample recommendation 1',
        'Sample recommendation 2'
      ]
    };
  }),
  saveCalculation: jest.fn().mockReturnValue('calc_123')
}));

describe('LightingPowerDensityCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the calculator with initial state', async () => {
    render(<LightingPowerDensityCalculator />);
    
    // Check title is rendered
    expect(screen.getByText('Lighting Power Density (LPD) Calculator')).toBeInTheDocument();
    
    // Check room info section is rendered
    expect(screen.getByText('Room Information')).toBeInTheDocument();
    
    // Check add fixtures section is rendered
    expect(screen.getByText('Add Fixtures')).toBeInTheDocument();
    
    // Wait for standards to load
    await waitFor(() => {
      expect(utils.loadBuildingStandards).toHaveBeenCalled();
    });
  });
  
  it('allows adding a fixture', async () => {
    render(<LightingPowerDensityCalculator />);
    
    // Wait for standards to load
    await waitFor(() => {
      expect(utils.loadBuildingStandards).toHaveBeenCalled();
    });
    
    // Click the Add Fixture button
    const addButton = screen.getByText('Add Fixture');
    fireEvent.click(addButton);
    
    // Check that fixture is added to the table
    expect(screen.getByText('LED Panel Light')).toBeInTheDocument();
  });
  
  it('performs calculation when Calculate LPD button is clicked', async () => {
    render(<LightingPowerDensityCalculator />);
    
    // Wait for standards to load
    await waitFor(() => {
      expect(utils.loadBuildingStandards).toHaveBeenCalled();
    });
    
    // Add a fixture
    const addButton = screen.getByText('Add Fixture');
    fireEvent.click(addButton);
    
    // Click Calculate button
    const calculateButton = screen.getByText('Calculate LPD');
    fireEvent.click(calculateButton);
    
    // Wait for calculation result
    await waitFor(() => {
      expect(utils.calculateLPDResults).toHaveBeenCalled();
      expect(screen.getByText('Calculation Results')).toBeInTheDocument();
    });
    
    // Check that results are displayed
    expect(screen.getByText('Total Lighting Power')).toBeInTheDocument();
    expect(screen.getByText('Lighting Power Density (LPD)')).toBeInTheDocument();
    expect(screen.getByText('Sample recommendation 1')).toBeInTheDocument();
  });
  
  it('allows saving calculation results', async () => {
    render(<LightingPowerDensityCalculator />);
    
    // Wait for standards to load
    await waitFor(() => {
      expect(utils.loadBuildingStandards).toHaveBeenCalled();
    });
    
    // Add a fixture
    const addButton = screen.getByText('Add Fixture');
    fireEvent.click(addButton);
    
    // Click Calculate button
    const calculateButton = screen.getByText('Calculate LPD');
    fireEvent.click(calculateButton);
    
    // Wait for calculation result
    await waitFor(() => {
      expect(utils.calculateLPDResults).toHaveBeenCalled();
    });
    
    // Mock window.alert
    const originalAlert = window.alert;
    window.alert = jest.fn();
    
    // Click Save Results button
    const saveButton = screen.getByText('Save Results');
    fireEvent.click(saveButton);
    
    // Check that save function was called
    await waitFor(() => {
      expect(utils.saveCalculation).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Calculation saved successfully!');
    });
    
    // Restore window.alert
    window.alert = originalAlert;
  });
  
  it('shows an error when calculating with invalid data', async () => {
    const mockedCalculateLPDResults = utils.calculateLPDResults as jest.Mock;
    mockedCalculateLPDResults.mockRejectedValueOnce(new Error('Room area must be greater than zero'));
    
    render(<LightingPowerDensityCalculator />);
    
    // Wait for standards to load
    await waitFor(() => {
      expect(utils.loadBuildingStandards).toHaveBeenCalled();
    });
    
    // Change area to zero
    const areaInput = screen.getByLabelText('Room Area');
    fireEvent.change(areaInput, { target: { value: '0' } });
    
    // Add a fixture
    const addButton = screen.getByText('Add Fixture');
    fireEvent.click(addButton);
    
    // Click Calculate button
    const calculateButton = screen.getByText('Calculate LPD');
    fireEvent.click(calculateButton);
    
    // Check that error is displayed
    await waitFor(() => {
      expect(screen.getByText('Calculation error: Room area must be greater than zero')).toBeInTheDocument();
    });
  });
}); 